'use client';

import { useRouter } from 'next/navigation';
import { useGuild } from '../../../../lib/guild-context';
import { Card, StatCard, Button, Icon } from '@hool/design-system';
import { RoleGate } from '../../../../components/role-gate';
import { Breadcrumb } from '../../../../components/breadcrumb';
import { motion } from 'framer-motion';

interface ToolInfo {
  name: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  requiresTool?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { guild, guildId, memberCount, permissions, canAccess } = useGuild();

  const breadcrumbItems = [
    { label: guild?.name || 'Guild', href: `/guilds/${guildId}` },
    { label: 'Dashboard' },
  ];

  // Define available tools
  const availableTools: ToolInfo[] = [
    {
      name: 'team-progress',
      label: 'Team Progress',
      description: 'Track guild-wide progress, ilvl targets, and member status',
      icon: 'zap',
      href: `/guilds/${guildId}/team-progress`,
    },
    {
      name: 'recruitment',
      label: 'Recruitment',
      description: 'Find, evaluate, and organize recruitment candidates',
      icon: 'search',
      href: `/guilds/${guildId}/recruitment`,
      requiresTool: true,
    },
  ].filter((tool) => !tool.requiresTool || canAccess(tool.name));

  // Count enabled tools
  const enabledToolsCount = permissions.filter((p) => p.enabled).length;

  return (
    <RoleGate minRank={1}>
      <div className="flex flex-col gap-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white m-0">Dashboard</h1>
          <p className="text-white/45 mt-1" style={{ fontSize: '0.8125rem' }}>
            Overview of guild tools and quick access to key features
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          <StatCard
            label="Members"
            value={memberCount}
            icon={<Icon name="user" size={20} />}
            variant="default"
          />
          <StatCard
            label="Tools Enabled"
            value={enabledToolsCount}
            icon={<Icon name="zap" size={20} />}
            variant="default"
          />
        </div>

        {/* Available Tools Section */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Available Tools</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {availableTools.map((tool) => (
              <motion.div
                key={tool.name}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  padding="lg"
                  variant="elevated"
                  interactive
                  className="h-full"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(tool.href)}
                    className="w-full bg-transparent border-none cursor-pointer p-0 text-left flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        name={tool.icon}
                        size={24}
                        className="text-white/60"
                      />
                      <h3 className="text-base font-bold text-white m-0">
                        {tool.label}
                      </h3>
                    </div>
                    <p className="text-sm text-white/50 m-0">
                      {tool.description}
                    </p>
                  </motion.button>
                </Card>
              </motion.div>
            ))}
          </div>

          {availableTools.length === 0 && (
            <Card padding="lg" variant="elevated">
              <div className="flex flex-col items-center gap-3 text-center p-8">
                <Icon name="zap" size={48} className="text-white/15" />
                <h3 className="text-base font-bold text-white m-0">
                  No Tools Available
                </h3>
                <p className="text-sm text-white/50 m-0 max-w-80">
                  Contact your Guild Master to enable tools for your guild
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* GM Actions Section */}
        <RoleGate minRank={0}>
          <div>
            <h2 className="text-lg font-bold text-white mb-4">
              Guild Master Actions
            </h2>
            <Card padding="lg" variant="elevated">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white m-0">
                    Guild Settings
                  </h3>
                  <p className="text-sm text-white/50 mt-1 m-0">
                    Configure tool permissions and guild preferences
                  </p>
                </div>
                <Button
                  variant="primary"
                  icon={<Icon name="settings" size={18} />}
                  onClick={() => router.push(`/guilds/${guildId}/settings`)}
                >
                  Settings
                </Button>
              </div>
            </Card>
          </div>
        </RoleGate>
      </div>
    </RoleGate>
  );
}
