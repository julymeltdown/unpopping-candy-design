import type { ComponentProps, ComponentType, CSSProperties } from 'react';
import { HomeOutlined } from '@ant-design/icons';

export type CommonspaceIconSize = 'sm' | 'md' | 'lg' | number;
type AntIconProps = ComponentProps<typeof HomeOutlined>;

export interface CommonspaceIconProps extends Omit<AntIconProps, 'aria-label'> {
  size?: CommonspaceIconSize | undefined;
  label?: string | undefined;
}

function sizeStyle(size: CommonspaceIconSize | undefined): CSSProperties | undefined {
  return typeof size === 'number' ? { fontSize: `${size}px` } : undefined;
}

export function createCommonspaceIcon(
  AntIcon: ComponentType<AntIconProps>,
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
