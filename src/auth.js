import { supabase } from './supabase.js';

export async function register(username, password, isCook = false) {
  const { data, error } = await supabase.auth.signUp({
    email: `${username}@dietsystem.local`,
    password: password,
    options: {
      data: { username, isCook }
    }
  });

  if (data?.user && isCook) {
    const { error: cookError } = await supabase
      .from('cooks')
      .insert([{ user_id: data.user.id, name: username }]);

    if (cookError) {
      console.error('Error creating cook profile:', cookError);
    }
  }

  return { data, error };
}

export async function login(username, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${username}@dietsystem.local`,
    password: password
  });

  return { data, error };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

export async function checkIfCook() {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data } = await supabase
    .from('cooks')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  return !!data;
}
