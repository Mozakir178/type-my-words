import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { api } from '../services/api';

const Profile = () => {
  const { user, updateStats } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '' });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/users/update', form);
      setEditMode(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-6">
        <h2 className="text-2xl font-bold">Account Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Username</label>
            <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded">{user?.username}</div>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded">{user?.email}</div>
          </div>
        </div>

        <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
      </div>

      <Modal isOpen={editMode} onClose={() => setEditMode(false)} title="Edit Profile">
        <form onSubmit={handleUpdate} className="space-y-4">
          <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full p-2 border rounded" placeholder="Username" />
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full p-2 border rounded" placeholder="Email" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditMode(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;