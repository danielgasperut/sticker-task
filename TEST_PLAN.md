# StickerTask Test Plan

## Test Infrastructure

- **Framework:** Vitest 4.x with jsdom environment
- **Component Testing:** @testing-library/react + @testing-library/user-event
- **Assertions:** vitest globals + @testing-library/jest-dom matchers
- **Mocking:** localStorage is mocked and cleared before each test; crypto.randomUUID is polyfilled

### Running Tests

```bash
npm test              # single run
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

---

## 1. Data Layer (store.ts)

### 1.1 Task CRUD
| # | Test Case | Expected |
|---|-----------|----------|
| 1 | Empty state | `getTasks()` returns `[]` |
| 2 | Save new task | Task appears in `getTasks()` |
| 3 | Update existing task | Task updated in place, no duplicates |
| 4 | Save multiple tasks | All stored, unique by id |
| 5 | Delete task | Task removed, its stickers removed |
| 6 | Delete non-existent task | No-op, other tasks untouched |

### 1.2 Sticker Awarding
| # | Test Case | Expected |
|---|-----------|----------|
| 7 | Empty state | `getAwardedStickers()` returns `[]` |
| 8 | Award one sticker | Appears in `getStickersForTask()` |
| 9 | Award multiple stickers | All stored with correct slotIndex |
| 10 | Remove sticker by id | Only that sticker removed |
| 11 | Remove non-existent | No-op |
| 12 | Stickers scoped to tasks | Filtering by taskId is correct |

### 1.3 Slot-Based Logic
| # | Test Case | Expected |
|---|-----------|----------|
| 13 | `getStickerAtSlot` finds correct slot | Returns sticker or undefined |
| 14 | `nextEmptySlot` returns first gap | Skips filled slots |
| 15 | `nextEmptySlot` returns null when full | No open slot |
| 16 | `nextEmptySlot` with enabledOnly | Skips locked slots |
| 17 | enabledOnly with no enabled slots | Returns null |
| 18 | enabledOnly when enabled slots are filled | Returns null |

### 1.4 Task Completion
| # | Test Case | Expected |
|---|-----------|----------|
| 19 | Fewer stickers than cost | `isTaskComplete` → false |
| 20 | Stickers equal to cost | `isTaskComplete` → true |
| 21 | Stickers exceed cost | `isTaskComplete` → true |
| 22 | Cost of 0 | Immediately complete |

### 1.5 Task Reset
| # | Test Case | Expected |
|---|-----------|----------|
| 23 | Reset clears stickers | `getStickersForTask` → [] |
| 24 | Reset clears slot permissions | `getEnabledSlots` → [] |
| 25 | Reset doesn't affect other tasks | Other task's stickers intact |
| 26 | Task still exists after reset | `getTasks` still contains it |

### 1.6 Slot Enable/Disable
| # | Test Case | Expected |
|---|-----------|----------|
| 27 | Default empty array | All locked |
| 28 | Set and get | Round-trips correctly |
| 29 | Per-task isolation | Different tasks have independent slots |
| 30 | Overwrite replaces | New array replaces old |

### 1.7 Category Management
| # | Test Case | Expected |
|---|-----------|----------|
| 31 | Default categories loaded | Includes Cleaning, Homework, Other, etc. |
| 32 | Add custom category | Appears in list |
| 33 | Prevent duplicate names | Case-insensitive dedup |
| 34 | Remove category | Removed from list |
| 35 | Remove non-existent | Safe no-op |
| 36 | Save/restore | Full replace works |
| 37 | `getCategoryIcon` known | Returns correct icon |
| 38 | `getCategoryIcon` unknown | Returns fallback 📌 |

### 1.8 localStorage Resilience
| # | Test Case | Expected |
|---|-----------|----------|
| 39 | Corrupted JSON | Returns fallback, no crash |
| 40 | Empty storage | Returns defaults |

---

## 2. Sticker Library (stickers.ts)

| # | Test Case | Expected |
|---|-----------|----------|
| 41 | Library is large | 100+ stickers |
| 42 | All stickers have required fields | id, emoji, name, category |
| 43 | All ids are unique | No duplicates |
| 44 | Multiple categories | 5+ categories |
| 45 | Every sticker's category in STICKER_CATEGORIES | Consistent |
| 46 | `getStickerById` valid id | Returns sticker |
| 47 | `getStickerById` invalid id | Returns undefined |
| 48 | Every category has ≥5 stickers | No sparse categories |

---

## 3. Types & Constants (types.ts)

| # | Test Case | Expected |
|---|-----------|----------|
| 49 | DEFAULT_CATEGORIES is non-empty | Has entries |
| 50 | Each has name and icon | No empty fields |
| 51 | Names are unique | No duplicates |
| 52 | Includes expected defaults | Cleaning, Homework, Behavior, Physical, Play, Other |

---

## 4. Component Tests

### 4.1 RoleSwitcher
| # | Test Case | Expected |
|---|-----------|----------|
| 53 | Renders both role buttons | Parent and Child visible |
| 54 | Switch to child (no password) | `onSwitch('child')` called |
| 55 | Switch to parent shows PIN prompt | Modal with PIN input |
| 56 | Wrong PIN rejected | Error message shown |
| 57 | Correct PIN (4321) accepted | `onSwitch('parent')` called |
| 58 | Cancel dismisses prompt | Modal disappears |
| 59 | Already parent — no prompt | Clicking Parent does nothing |
| 60 | Only numeric input accepted | Letters filtered out |

### 4.2 TaskForm
| # | Test Case | Expected |
|---|-----------|----------|
| 61 | Create mode — empty fields | Title empty, button says "Create Task" |
| 62 | Submit creates task | Task in store |
| 63 | Empty title rejected | No submit, no task created |
| 64 | Back button calls onBack | Navigation fires |
| 65 | Category buttons rendered | Cleaning, Homework visible |
| 66 | Slider defaults to 3 | Range input value = 3 |
| 67 | Edit mode — pre-filled | Title, description, cost shown |
| 68 | Edit preserves id/createdAt | Not overwritten |

### 4.3 ParentHome
| # | Test Case | Expected |
|---|-----------|----------|
| 69 | Renders dashboard title | "Parent Dashboard" |
| 70 | Stats zeros when empty | All stat cards show 0 |
| 71 | Stats with data | Correct counts |
| 72 | Navigate to manage tasks | `onNavigate('manage-tasks')` |
| 73 | Navigate to create task | `onNavigate('create-task')` |
| 74 | Navigate to manage categories | `onNavigate('manage-categories')` |
| 75 | Shows active task list | Task title and progress |

### 4.4 ChildHome
| # | Test Case | Expected |
|---|-----------|----------|
| 76 | Renders child heading | "My Stickers!" |
| 77 | Empty state | "No tasks yet" |
| 78 | Shows active tasks | Title, description, sticker count |
| 79 | No unlocked slots — "ask parent" | Button hidden, message shown |
| 80 | Unlocked slots — Pick button | Button visible |
| 81 | Trophy room button when complete | Shows button with count |
| 82 | Navigate to trophy room | `onNavigate('trophy-room')` |

### 4.5 ManageTasks
| # | Test Case | Expected |
|---|-----------|----------|
| 83 | Renders heading | "Manage Tasks" |
| 84 | Empty state | "No tasks yet" |
| 85 | Shows tasks | Title and sticker progress |
| 86 | Navigate to create | `onNavigate('create-task')` |
| 87 | Navigate to award | `onNavigate('award-sticker', id)` |
| 88 | Navigate to edit | `onNavigate('edit-task', id)` |
| 89 | Delete with confirmation | Two clicks, task removed |
| 90 | Reset button on completed task | Button visible |
| 91 | Category filter | Shows only matching tasks |
| 92 | Back button | `onBack` called |

### 4.6 ManageCategories
| # | Test Case | Expected |
|---|-----------|----------|
| 93 | Renders heading | "Manage Categories" |
| 94 | Shows default categories | Cleaning, Homework listed |
| 95 | Add new category | Appears in store |
| 96 | Delete with confirmation | Two clicks, category removed |
| 97 | Back button | `onBack` called |

### 4.7 AwardSticker (Parent)
| # | Test Case | Expected |
|---|-----------|----------|
| 98 | Renders task info | Title and description shown |
| 99 | Sticker category tabs | Animals, Stars, Food visible |
| 100 | Award sticker on click | Sticker stored at slot |
| 101 | Slot buttons rendered | Correct count |
| 102 | Toggle slot enables child | Slot in store |
| 103 | Back button | `onBack` called |
| 104 | Shows remaining count | "X stickers needed" |

### 4.8 PickSticker (Child)
| # | Test Case | Expected |
|---|-----------|----------|
| 105 | Renders task title | Title shown |
| 106 | Library visible when unlocked | Category tabs shown |
| 107 | Library hidden when all locked | Tabs not in DOM |
| 108 | Library hidden by default (no enabled) | Tabs not in DOM |
| 109 | Sticker goes to correct unlocked slot | `getStickerAtSlot` confirms |
| 110 | Fills first available unlocked slot | Skips locked, fills enabled |
| 111 | Lock icons for locked slots | 🔒 visible |
| 112 | Sparkle for unlocked empty slots | ✨ visible |
| 113 | Back button | `onBack` called |
| 114 | Shows remaining counts | Enabled and locked counts |

### 4.9 TrophyRoom
| # | Test Case | Expected |
|---|-----------|----------|
| 115 | Renders heading | "Trophy Room" |
| 116 | Empty case when no completions | "Your trophy case is empty" |
| 117 | Completed tasks grouped by category | Category shelf labels |
| 118 | Stats plaque | Trophies, Stickers, Categories |
| 119 | Click trophy opens zoom | Sticker Collection shown |
| 120 | Close zoom with ✕ | Modal disappears |
| 121 | Multiple categories on separate shelves | Both labels visible |

---

## 5. Edge Cases & Integration Scenarios

| # | Scenario | Expected |
|---|----------|----------|
| 122 | Task with cost 1, one sticker | Immediately complete, appears in trophy room |
| 123 | Task with cost 10 | All 10 slots render, all fillable |
| 124 | Delete task with stickers | Both task and stickers removed |
| 125 | Reset completed task | Returns to active, stickers cleared |
| 126 | Parent awards sticker, child picks rest | Both types in trophy zoom |
| 127 | All slots locked then all unlocked | Child can now fill all |
| 128 | Category deleted but task still uses it | Task renders with fallback icon 📌 |
| 129 | Multiple tasks same category, some complete | Trophy room groups correctly |
| 130 | Rapid sticker awarding | No double-fills on same slot |
| 131 | Browser refresh mid-session | All data persists via localStorage |
| 132 | Switch role parent→child→parent | PIN required each time entering parent |
| 133 | Wrong PIN multiple times | Error resets each time, no lockout |
| 134 | Create task with max cost (10) | 10 slot buttons render |
| 135 | Create task with min cost (1) | 1 slot button renders |
| 136 | Very long task title | Truncated in lists, full in zoom |
| 137 | Task with empty description | Renders without error |
| 138 | Award all stickers as parent (no child slots) | Task completes, trophy room works |
| 139 | Award all stickers as child (all slots enabled) | Task completes |
| 140 | Mix of parent and child stickers | Both tracked in trophy zoom with correct icons |

---

## 6. Manual / Visual Tests

These require running the app (`npm run dev`) and cannot be automated:

| # | Scenario | What to check |
|---|----------|---------------|
| M1 | Drag sticker in child mode | Sticker lands in drop zone, fills correct slot |
| M2 | Drag sticker in parent mode | Same drag behavior works |
| M3 | Trophy zoom animation | Smooth fadeIn + zoomIn, floating 🏆 |
| M4 | Trophy case visual | Wood frame, glass reflections, shelf bottoms |
| M5 | Responsive layout | Works on mobile width (375px) and desktop |
| M6 | Sticker hover animations | Scale up on hover in library |
| M7 | PIN input UX | Shake animation on wrong PIN |
| M8 | Category filter scroll | Horizontal scroll on overflow |
| M9 | Slot toggle visual feedback | Immediate color/icon change |
| M10 | Completion celebration | 🎉🏆🎉 confetti display in pick screen |
