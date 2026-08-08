import type { ComponentType, CSSProperties } from 'react';
import type { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon';

export type CommonspaceIconSize = 'sm' | 'md' | 'lg' | number;

export interface CommonspaceIconProps extends Omit<AntdIconProps, 'aria-label'> {
  size?: CommonspaceIconSize | undefined;
  label?: string | undefined;
}

function sizeStyle(size: CommonspaceIconSize | undefined): CSSProperties | undefined {
  return typeof size === 'number' ? { fontSize: `${size}px` } : undefined;
}

export function createCommonspaceIcon(
  AntIcon: ComponentType<AntdIconProps>,
  semanticName: string,
) {
  function CommonspaceIcon({ className, label, size = 'md', style, ...props }: CommonspaceIconProps) {
    return (
      <AntIcon
        {...props}
        className={className ? `cs-icon ${className}` : 'cs-icon'}
        data-cs-icon={semanticName}
        data-cs-icon-size={typeof size === 'number' ? 'custom' : size}
        aria-hidden={label ? undefined : true}
        aria-label={label}
        role={label ? 'img' : undefined}
        style={{ ...sizeStyle(size), ...style }}
      />
    );
  }

  CommonspaceIcon.displayName = semanticName;
  return CommonspaceIcon;
}
