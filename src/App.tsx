import { useState, useCallback, useEffect } from 'react';
import type { Role, Screen, Child } from './types';
import type { User } from 'firebase/auth';
import type { FamilyProfile } from './auth';
import { onAuthChange, getFamilyProfile, logout } from './auth';
import { getTasks, getAwardedStickers, getChildById, setStoreAccount, loadInitialData, setOnUpdate } from './store';
import { AuthScreen } from './components/AuthScreen';
import { RoleSwitcher } from './components/RoleSwitcher';
import { ParentHome } from './components/ParentHome';
import { ChildHome } from './components/ChildHome';
import { TaskForm } from './components/TaskForm';
import { ManageTasks } from './components/ManageTasks';
import { AwardSticker } from './components/AwardSticker';
import { PickSticker } from './components/PickSticker';
import { TrophyRoom } from './components/TrophyRoom';
import { ManageCategories } from './components/ManageCategories';
import { ManageChildren } from './components/ManageChildren';
import { Analytics } from './components/Analytics';

function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FamilyProfile | null>(null);
  const [role, setRole] = useState<Role>('parent');
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    setOnUpdate(refresh);
    return () => setOnUpdate(null);
  }, [refresh]);

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setStoreAccount(firebaseUser.uid);
          await loadInitialData();
          const p = await getFamilyProfile(firebaseUser.uid);
          setUser(firebaseUser);
          setProfile(p);
        } else {
          setStoreAccount(null);
          setUser(null);
          setProfile(null);
        }
      } catch {
        setStoreAccount(null);
        setUser(null);
        setProfile(null);
      } finally {
        setAuthLoading(false);
      }
    });
    return unsub;
  }, []);

  const handleLogin = (firebaseUser: User, familyProfile: FamilyProfile) => {
    setUser(firebaseUser);
    setProfile(familyProfile);
    setRole('parent');
    setScreen('home');
  };

  const handleLogout = async () => {
    await logout();
    setStoreAccount(null);
    setUser(null);
    setProfile(null);
    setRole('parent');
    setScreen('home');
    setSelectedTaskId(null);
    setActiveChildId(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-3 animate-bounce">⭐</div>
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const allTasks = getTasks();
  const allStickers = getAwardedStickers();
  void refreshKey;

  const activeChild: Child | null = activeChildId ? getChildById(activeChildId) ?? null : null;

  const tasks = role === 'child' && activeChildId
    ? allTasks.filter((t) => t.childId === activeChildId || !t.childId)
    : allTasks;
  const stickers = role === 'child' && activeChildId
    ? allStickers.filter((s) => tasks.some((t) => t.id === s.taskId))
    : allStickers;

  const navigateTo = (s: Screen, taskId?: string) => {
    setScreen(s);
    if (taskId) setSelectedTaskId(taskId);
  };

  const goHome = () => {
    setScreen('home');
    setSelectedTaskId(null);
    refresh();
  };

  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) ?? null
    : null;

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={goHome}
            className="text-xl font-bold bg-gradient-to-r from-primary to-pink text-transparent bg-clip-text hover:opacity-80 transition"
          >
            ⭐ {profile.familyName}
          </button>
          <RoleSwitcher
            role={role}
            activeChild={activeChild}
            parentPin={profile.parentPin}
            onSwitch={(r, childId) => {
              setRole(r);
              if (childId) setActiveChildId(childId);
              else if (r === 'parent') setActiveChildId(null);
              goHome();
            }}
            onLogout={handleLogout}
          />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-6">
        {screen === 'home' && role === 'parent' && (
          <ParentHome tasks={allTasks} stickers={allStickers} onNavigate={navigateTo} onRefresh={refresh} />
        )}
        {screen === 'home' && role === 'child' && (
          <ChildHome tasks={tasks} stickers={stickers} activeChild={activeChild} onNavigate={navigateTo} />
        )}
        {screen === 'manage-tasks' && (
          <ManageTasks
            tasks={allTasks}
            stickers={allStickers}
            onNavigate={navigateTo}
            onBack={goHome}
            onRefresh={refresh}
          />
        )}
        {(screen === 'create-task' || screen === 'edit-task') && (
          <TaskForm
            task={screen === 'edit-task' ? selectedTask : null}
            onSave={() => { refresh(); navigateTo('manage-tasks'); }}
            onBack={() => navigateTo('manage-tasks')}
          />
        )}
        {screen === 'award-sticker' && selectedTask && (
          <AwardSticker
            task={selectedTask}
            stickers={stickers}
            onBack={() => navigateTo('manage-tasks')}
            onAwarded={refresh}
          />
        )}
        {screen === 'pick-sticker' && selectedTask && (
          <PickSticker
            task={selectedTask}
            stickers={stickers}
            onBack={goHome}
            onPicked={refresh}
          />
        )}
        {screen === 'trophy-room' && (
          <TrophyRoom tasks={tasks} stickers={stickers} onBack={goHome} />
        )}
        {screen === 'manage-categories' && (
          <ManageCategories onBack={goHome} onRefresh={refresh} />
        )}
        {screen === 'manage-children' && (
          <ManageChildren onBack={goHome} onRefresh={refresh} />
        )}
        {screen === 'analytics' && (
          <Analytics tasks={allTasks} stickers={allStickers} onBack={goHome} />
        )}
      </main>
    </div>
  );
}

export default App;
