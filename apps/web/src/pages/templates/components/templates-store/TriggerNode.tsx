import { Handle, type NodeProps, Position } from 'react-flow-renderer';

import { BoltOutlinedGradient } from '@novu/design-system';
import { NodeStep } from '../../../../components/workflow';

export const TriggerNode = ({ data }: NodeProps) => {
  return (
    <NodeStep
      data={data}
      Icon={BoltOutlinedGradient}
      Handlers={() => {
        return (
          <>
            <Handle type="source" position={Position.Bottom} />
          </>
        );
      }}
    />
  );
};
