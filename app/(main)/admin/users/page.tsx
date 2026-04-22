'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { timeAgo } from '@/lib/utils';
import { ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import { UserAvatar } from '@/components/ui/UserAvatar';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateRole = async (userId: string, role: string) => {
    const supabase = createClient();
    await supabase.from('users').update({ role }).eq('id', userId);
    toast.success(`Role updated to ${role}`);
    fetchUsers();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user? This will also delete all their listings.')) return;
    const supabase = createClient();
    await supabase.from('users').delete().eq('id', userId);
    toast.success('User deleted');
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="card-elevated overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-zinc-900/80">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">User</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Joined</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className={i % 2 === 0 ? 'bg-zinc-950/40' : 'bg-zinc-900/25'}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <UserAvatar avatarUrl={u.avatar_url} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-slate-100">{u.full_name || 'No name'}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    className="input-field !py-1.5 !px-2.5 text-xs w-auto"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-sm text-slate-500">{timeAgo(u.created_at)}</span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="btn-ghost p-2 text-xs text-red-500"
                    title="Delete user"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
