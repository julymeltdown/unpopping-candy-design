import type { ComponentProps, ComponentType, CSSProperties } from 'react';
import { HomeOutlined } from '@ant-design/icons';

export type UnpoppingCandyIconSize = 'sm' | 'md' | 'lg' | number;
type AntIconProps = ComponentProps<typeof HomeOutlined>;

export interface UnpoppingCandyIconProps extends Omit<AntIconProps, 'aria-label' | 'size'> {
  size?: UnpoppingCandyIconSize | undefined;
  label?: string | undefined;
}

function sizeStyle(size: UnpoppingCandyIconSize | undefined): CSSProperties | undefined {
  return typeof size === 'number' ? { fontSize: `${size}px` } : undefined;
}

export function createUnpoppingCandyIcon(
  AntIcon: ComponentType<AntIconProps>,
  semanticName: string,
) {
  function UnpoppingCandyIcon({ className, label, size = 'md', style, ...props }: UnpoppingCandyIconProps) {
    return (
      <AntIcon
        {...props}
        className={className ? `popcandy-icon ${className}` : 'popcandy-icon'}
        data-popcandy-icon={semanticName}
        data-popcandy-icon-size={typeof size === 'number' ? 'custom' : size}
        aria-hidden={label ? undefined : true}
        aria-label={label}
        role={label ? 'img' : undefined}
        style={{ ...sizeStyle(size), ...style }}
      />
    );
  }

  UnpoppingCandyIcon.displayName = semanticName;
  return UnpoppingCandyIcon;
}
