'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TasksResponse, TaskItem } from '../types';
import { hexToRgba } from '../utils';
import { SectionCard } from './section-card';
import { Checkbox, Icon } from '@hool/design-system';
import { progressApi } from '../../../../../../lib/api';

interface WeeklyTasksSectionProps {
  tasksData: TasksResponse;
  characterId: number;
  guildId: string;
  classColor: string;
  selectedWeek?: number;
}

export function WeeklyTasksSection({
  tasksData,
  characterId,
  guildId,
  classColor,
  selectedWeek,
}: WeeklyTasksSectionProps) {
  const [weeklyTasks, setWeeklyTasks] = useState<TaskItem[]>(tasksData.weekly);
  const [dailyTasks, setDailyTasks] = useState<TaskItem[]>(tasksData.daily);
  const [weekName, setWeekName] = useState(tasksData.week_name);
  const [activeWeek, setActiveWeek] = useState(tasksData.current_week);
  const [isLoadingWeek, setIsLoadingWeek] = useState(false);

  // Fetch tasks for a different week when selectedWeek changes
  const fetchTasksForWeek = useCallback(
    async (week: number) => {
      setIsLoadingWeek(true);
      try {
        const data = await progressApi.get<TasksResponse>(
          `/guilds/${guildId}/characters/${characterId}/tasks?week=${week}`,
        );
        setWeeklyTasks(data.weekly);
        setDailyTasks(data.daily);
        setWeekName(data.week_name);
        setActiveWeek(week);
      } catch (err) {
        console.error('Failed to fetch tasks for week:', err);
      } finally {
        setIsLoadingWeek(false);
      }
    },
    [guildId, characterId],
  );

  useEffect(() => {
    if (selectedWeek !== undefined && selectedWeek !== activeWeek) {
      fetchTasksForWeek(selectedWeek);
    }
  }, [selectedWeek, activeWeek, fetchTasksForWeek]);

  // Re-sync when tasksData prop changes (e.g. full refresh)
  useEffect(() => {
    setWeeklyTasks(tasksData.weekly);
    setDailyTasks(tasksData.daily);
    setWeekName(tasksData.week_name);
    setActiveWeek(tasksData.current_week);
  }, [tasksData]);

  const allTasks = [...weeklyTasks, ...dailyTasks];
  const done = allTasks.filter((t) => t.done).length;
  const total = allTasks.length;
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  // Confetti on 100% completion
  const [showConfetti, setShowConfetti] = useState(false);
  const prevPercentageRef = useRef(percentage);
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      prevPercentageRef.current = percentage;
      return;
    }
    if (percentage === 100 && prevPercentageRef.current < 100) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
    prevPercentageRef.current = percentage;
  }, [percentage]);

  const handleToggle = async (
    task: TaskItem,
    type: 'weekly' | 'daily',
    checked: boolean,
  ) => {
    const setTasks = type === 'weekly' ? setWeeklyTasks : setDailyTasks;
    const previousTasks = type === 'weekly' ? [...weeklyTasks] : [...dailyTasks];

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              done: checked,
              completed_at: checked ? new Date().toISOString() : null,
            }
          : t,
      ),
    );

    try {
      await progressApi.post(
        `/guilds/${guildId}/characters/${characterId}/tasks`,
        {
          task_id: task.id,
          task_type: type,
          week_number: activeWeek,
          completed: checked,
        },
      );
    } catch (error) {
      // Revert optimistic update on error
      setTasks(previousTasks);
      console.error('Failed to toggle task:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SectionCard title="Tasks" subtitle={weekName || 'Weekly Tasks'}>
      {isLoadingWeek ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}>
          <Icon name="refresh" size={20} animation="spin" className="text-white/30" />
        </div>
      ) : (
        <>
          {/* Progress bar header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Progress
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              {done}/{total} ({percentage}%)
            </span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'visible',
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: '100%',
                borderRadius: 4,
                background: `linear-gradient(90deg, ${hexToRgba(classColor, 0.6)} 0%, ${classColor} 100%)`,
                transition: 'width 0.3s ease',
              }}
            />

            {/* Confetti burst on 100% */}
            <AnimatePresence>
              {showConfetti &&
                Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i / 24) * 360 + (Math.random() * 30 - 15);
                  const distance = 40 + Math.random() * 80;
                  const rad = (angle * Math.PI) / 180;
                  const x = Math.cos(rad) * distance;
                  const y = Math.sin(rad) * distance - 20;
                  const size = 4 + Math.random() * 4;
                  const colors = [classColor, '#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#FB923C'];
                  const color = colors[i % colors.length];
                  const shape = i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0';

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
                      animate={{
                        opacity: 0,
                        x,
                        y,
                        scale: [1, 1.2, 0],
                        rotate: Math.random() * 720 - 360,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2 + Math.random() * 0.6, ease: 'easeOut' }}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '50%',
                        width: size,
                        height: size,
                        borderRadius: shape,
                        backgroundColor: color,
                        pointerEvents: 'none',
                        zIndex: 20,
                      }}
                    />
                  );
                })}
            </AnimatePresence>
          </div>

          {/* Weekly tasks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {weeklyTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Checkbox
                  checked={task.done}
                  label={task.label}
                  onChange={(checked) => handleToggle(task, 'weekly', checked)}
                  size="sm"
                />
                {task.done && task.completed_at && (
                  <span
                    style={{
                      fontSize: 11,
                      color: 'rgba(255, 255, 255, 0.3)',
                      whiteSpace: 'nowrap',
                      marginLeft: 8,
                    }}
                  >
                    {formatTimestamp(task.completed_at)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Daily tasks */}
          {dailyTasks.length > 0 && (
            <>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginTop: 20,
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Daily Tasks
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dailyTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Checkbox
                      checked={task.done}
                      label={task.label}
                      onChange={(checked) => handleToggle(task, 'daily', checked)}
                      size="sm"
                    />
                    {task.done && task.completed_at && (
                      <span
                        style={{
                          fontSize: 11,
                          color: 'rgba(255, 255, 255, 0.3)',
                          whiteSpace: 'nowrap',
                          marginLeft: 8,
                        }}
                      >
                        {formatTimestamp(task.completed_at)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </SectionCard>
  );
}
