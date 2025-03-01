import React, { useMemo, useState } from 'react';
import { Services } from 'components-react/service-provider';
import { useVuex } from 'components-react/hooks';
import { useModule } from 'slap';
import { SourceSelectorModule } from './SourceSelector';
import { Tooltip } from 'antd';
import { $t } from 'services/i18n';

interface IDualOutputSourceSelector {
  nodeId: string;
  sceneId?: string;
}
export function DualOutputSourceSelector(p: IDualOutputSourceSelector) {
  const { toggleVisibility, makeActive, horizontalActive, verticalActive } = useModule(
    SourceSelectorModule,
  );
  const { DualOutputService } = Services;

  const [hoveredIcon, setHoveredIcon] = useState('');

  const v = useVuex(() => ({
    verticalNodeId:
      DualOutputService.views.verticalNodeIds && horizontalActive
        ? DualOutputService.views.activeSceneNodeMap[p.nodeId]
        : p.nodeId,
    isHorizontalVisible:
      !DualOutputService.views.isLoading &&
      DualOutputService.views.getIsHorizontalVisible(p.nodeId, p?.sceneId),
    isVerticalVisible:
      !DualOutputService.views.isLoading &&
      DualOutputService.views.getIsVerticalVisible(p.nodeId, p?.sceneId),
    isLoading: DualOutputService.views.isLoading && !DualOutputService.views.hasVerticalNodes,
  }));

  const showHorizontalToggle = useMemo(() => {
    return !v.isLoading && horizontalActive;
  }, [!v.isLoading, horizontalActive]);

  const showVerticalToggle = useMemo(() => {
    return !v.isLoading && v?.verticalNodeId && verticalActive;
  }, [!v.isLoading, v?.verticalNodeId, verticalActive]);

  const horizontalToggleMessage = useMemo(() => {
    return v.isHorizontalVisible ? $t('Hide from Horizontal') : $t('Show in Horizontal');
  }, [v.isHorizontalVisible]);

  const verticalToggleMessage = useMemo(() => {
    return v.isVerticalVisible ? $t('Hide from Vertical') : $t('Show in Vertical');
  }, [v.isVerticalVisible]);

  return (
    <>
      {showHorizontalToggle && (
        <Tooltip
          title={horizontalToggleMessage}
          placement="left"
          visible={['icon-desktop', 'icon-desktop-hide'].includes(hoveredIcon)}
        >
          <i
            onClick={() => {
              toggleVisibility(p.nodeId);
              makeActive(p.nodeId);
            }}
            className={v.isHorizontalVisible ? 'icon-desktop' : 'icon-desktop-hide'}
            style={{ marginRight: '8px' }}
            onMouseEnter={() =>
              setHoveredIcon(v.isVerticalVisible ? 'icon-desktop' : 'icon-desktop-hide')
            }
            onMouseLeave={() => setHoveredIcon('')}
          />
        </Tooltip>
      )}

      {showVerticalToggle && (
        <Tooltip
          title={verticalToggleMessage}
          placement="left"
          visible={['icon-phone-case', 'icon-phone-case-hide'].includes(hoveredIcon)}
        >
          <i
            onClick={() => {
              toggleVisibility(v.verticalNodeId);
              makeActive(v.verticalNodeId);
            }}
            className={v.isVerticalVisible ? 'icon-phone-case' : 'icon-phone-case-hide'}
            style={{ marginRight: '8px' }}
            onMouseEnter={() =>
              setHoveredIcon(v.isVerticalVisible ? 'icon-phone-case' : 'icon-phone-case-hide')
            }
            onMouseLeave={() => setHoveredIcon('')}
          />
        </Tooltip>
      )}
    </>
  );
}
