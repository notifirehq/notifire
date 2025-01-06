import { CreateWorkflowButton } from '@/components/create-workflow-button';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { FeatureFlagsKeysEnum } from '@novu/shared';
import {
  Calendar,
  Code2,
  ExternalLink,
  FileCode2,
  FileText,
  KeyRound,
  LayoutGrid,
  Sparkles,
  Users,
  Wand2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { Badge } from '../primitives/badge';
import { WorkflowMode } from './types';

interface WorkflowSidebarProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  onGenerateClick: () => void;
  onFromPromptClick: () => void;
  mode: WorkflowMode;
}

interface SidebarButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  bgColor?: string;
  asChild?: boolean;
  hasExternalLink?: boolean;
  beta?: boolean;
}

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.01 },
  tap: { scale: 0.99 },
};

const iconVariants = {
  initial: { rotate: 0 },
  hover: { rotate: 5 },
};

function SidebarButton({
  icon,
  label,
  onClick,
  isActive,
  bgColor = 'bg-blue-50',
  asChild,
  beta,
  hasExternalLink,
}: SidebarButtonProps) {
  const ButtonWrapper = asChild ? CreateWorkflowButton : motion.button;
  const content = (
    <div className="flex items-center gap-3">
      <motion.div variants={iconVariants} className={`rounded-lg p-[5px] ${bgColor}`}>
        {icon}
      </motion.div>
      <span className="text-label-sm text-strong-950">{label}</span>
      {hasExternalLink && (
        <motion.div whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 300 }} className="ml-auto">
          <ExternalLink className="text-foreground-600 h-3 w-3" />
        </motion.div>
      )}
    </div>
  );

  return (
    <ButtonWrapper
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-xl border border-transparent p-1.5 transition-colors hover:cursor-pointer hover:bg-gray-100 ${
        isActive ? '!border-[#EEEFF1] bg-white' : ''
      }`}
    >
      {asChild ? (
        content
      ) : (
        <div className="flex w-full items-center gap-2">
          {content}{' '}
          {beta && (
            <Badge kind="pill" size="2xs">
              BETA
            </Badge>
          )}
        </div>
      )}
    </ButtonWrapper>
  );
}

const useCases = [
  {
    id: 'popular',
    icon: <LayoutGrid className="h-3 w-3 text-gray-700" />,
    label: 'Popular',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'events',
    icon: <Calendar className="h-3 w-3 text-gray-700" />,
    label: 'Events',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'authentication',
    icon: <KeyRound className="h-3 w-3 text-gray-700" />,
    label: 'Authentication',
    bgColor: 'bg-green-50',
  },
  {
    id: 'social',
    icon: <Users className="h-3 w-3 text-gray-700" />,
    label: 'Social',
    bgColor: 'bg-purple-50',
  },
] as const;

const createOptions = [
  {
    icon: <FileText className="h-3 w-3 text-gray-700" />,
    label: 'Blank workflow',
    bgColor: 'bg-green-50',
    asChild: true,
  },
  {
    icon: <Code2 className="h-3 w-3 text-gray-700" />,
    label: 'Code-based workflow',
    hasExternalLink: true,
    bgColor: 'bg-blue-50',
    onClick: () => window.open('https://docs.novu.co/framework/overview', '_blank'),
  },
];

export function WorkflowSidebar({
  selectedCategory,
  onCategorySelect,
  onGenerateClick,
  onFromPromptClick,
  mode,
}: WorkflowSidebarProps) {
  const isAiTemplateStoreEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_AI_TEMPLATE_STORE_ENABLED);

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <section className="p-2">
        <div className="mb-2">
          <span className="text-subheading-2xs text-gray-500">CREATE</span>
        </div>
        <div className="flex flex-col gap-2">
          {isAiTemplateStoreEnabled && (
            <SidebarButton
              icon={<Wand2 className="h-3 w-3 text-gray-700" />}
              label="From prompt"
              beta
              onClick={onFromPromptClick}
              isActive={mode === WorkflowMode.FROM_PROMPT}
              bgColor="bg-blue-50"
            />
          )}
          {createOptions.map((item, index) => (
            <SidebarButton
              key={index}
              icon={item.icon}
              label={item.label}
              onClick={item.onClick}
              bgColor={item.bgColor}
              asChild={item.asChild}
              hasExternalLink={item.hasExternalLink}
            />
          ))}
        </div>
      </section>
      <section className="p-2">
        <div className="mb-2">
          <span className="text-subheading-2xs text-gray-500">EXPLORE</span>
        </div>

        <div className="flex flex-col gap-2">
          {isAiTemplateStoreEnabled && (
            <SidebarButton
              icon={<Sparkles className="h-3 w-3 text-gray-700" />}
              label="AI Suggestions"
              beta
              onClick={onGenerateClick}
              isActive={mode === WorkflowMode.GENERATE}
              bgColor="bg-purple-50"
            />
          )}
          {useCases.map((item) => (
            <SidebarButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              onClick={() => onCategorySelect(item.id)}
              isActive={mode === WorkflowMode.TEMPLATES && selectedCategory === item.id}
              bgColor={item.bgColor}
            />
          ))}
        </div>
      </section>

      <div className="mt-auto p-3">
        <motion.div
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          className="border-stroke-soft flex flex-col items-start rounded-xl border bg-white p-3 hover:cursor-pointer"
          onClick={() => window.open('https://docs.novu.co/workflow/overview', '_blank')}
        >
          <div className="mb-1 flex items-center gap-1.5">
            <motion.div variants={iconVariants} className="rounded-lg bg-gray-50 p-1.5">
              <FileCode2 className="h-3 w-3 text-gray-700" />
            </motion.div>
            <span className="text-label-sm text-strong-950">Documentation</span>
          </div>

          <p className="text-paragraph-xs text-neutral-400">Find out more about how to best setup workflows</p>
        </motion.div>
      </div>
    </div>
  );
}