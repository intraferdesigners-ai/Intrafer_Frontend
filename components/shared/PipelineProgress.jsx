import { PIPELINE, getStageIndex } from '../../lib/leadPipeline';

export default function PipelineProgress({ status }) {
  const stageIndex = getStageIndex(status);
  if (stageIndex === -1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {PIPELINE.map((stage, i) => {
        const isPast    = i < stageIndex;
        const isCurrent = i === stageIndex;
        const isFuture  = i > stageIndex;
        return (
          <div key={stage.key} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              title={stage.label}
              style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: (isPast || isCurrent) ? 'var(--color-primary)' : 'transparent',
                border: isFuture
                  ? '1.5px solid var(--color-border)'
                  : '1.5px solid var(--color-primary)',
              }}
            />
            {i < PIPELINE.length - 1 && (
              <div style={{
                width: 14, height: 1,
                background: isPast ? 'var(--color-primary)' : 'var(--color-border)',
                opacity: isPast ? 0.4 : 1,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
