'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE } from '@/lib/auth/guard';
import { getAdminConfig } from '@/lib/auth/admin-config';
import { verifyPassword } from '@/lib/auth/password';
import { signSession } from '@/lib/auth/session';
import { audit } from '@/lib/audit';
import { rateLimit } from '@/lib/utils/rate-limit';
import { clientKeyFrom } from '@/lib/utils/request';

const SESSION_MS = 8 * 60 * 60 * 1000;

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase().slice(0, 120);
  const password = String(formData.get('password') ?? '').slice(0, 200);
  const clientKey = clientKeyFrom(await headers());

  if (!rateLimit(`login:${clientKey}`, 5, 15 * 60 * 1000)) {
    await audit('anonyme', 'auth.login_blocked', null, { source: clientKey });
    redirect('/admin/login?erreur=trop_de_tentatives');
  }

  const config = getAdminConfig();
  if (!config || email !== config.email || !verifyPassword(password, config.passwordHash)) {
    await audit('anonyme', 'auth.login_failed', null, { source: clientKey });
    redirect('/admin/login?erreur=identifiants');
  }

  const token = signSession({ sub: config.email, role: config.role, exp: Date.now() + SESSION_MS });
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MS / 1000,
  });
  await audit(config.email, 'auth.login', null, { role: config.role });
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect('/admin/login');
}
