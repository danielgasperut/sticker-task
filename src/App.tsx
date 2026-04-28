import { useState, useCallback } from 'react';
import type { Role, Screen, Child } from './types';
import { getTasks, getAwardedStickers, getChildById } from './store';
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
  const [role, setRole] = useState<Role>('parent');
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

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
            className="text-2xl font-bold bg-gradient-to-r from-primary to-pink text-transparent bg-clip-text hover:opacity-80 transition"
          >
            ⭐ StickerTask
          </button>
          <RoleSwitcher
            role={role}
            activeChild={activeChild}
            onSwitch={(r, childId) => {
              setRole(r);
              if (childId) setActiveChildId(childId);
              else if (r === 'parent') setActiveChildId(null);
              goHome();
            }}
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
