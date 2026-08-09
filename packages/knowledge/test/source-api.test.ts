import assert from 'node:assert/strict';
import test from 'node:test';
import { extractComponentApi, extractExportedInterfaces } from '../src/source-api.ts';

test('extracts custom props, requiredness, and native element from a public interface', () => {
  const source = `export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | undefined;
    pending: boolean;
    onCommit(id: string): void;
  }`;
  const api = extractComponentApi(source, 'Button');
  assert.equal(api.nativeElement, 'button');
  assert.deepEqual(api.props, [
    { name: 'onCommit', type: '(id: string) => void', required: true },
    { name: 'pending', type: 'boolean', required: true },
    { name: 'variant', type: "'primary' | 'secondary' | undefined", required: false },
  ]);
});

test('keeps nested object types intact and infers direct native function props', () => {
  const source = `export interface FieldProps { counter?: { current: number; maximum: number } | undefined; }
  export function VisuallyHidden(props: HTMLAttributes<HTMLSpanElement>) { return null }`;
  assert.equal(extractComponentApi(source, 'Field').props[0]?.type, '{ current: number; maximum: number } | undefined');
  assert.equal(extractComponentApi(source, 'VisuallyHidden').nativeElement, 'span');
});

test('exported interface registry exposes Pick sources for inherited public props', () => {
  const source = `export interface ActionProps { locale?: string; onLike?: (() => void) | undefined; }
  export interface CardProps extends Pick<ActionProps, 'locale' | 'onLike'> { post: string; }`;
  const interfaces = extractExportedInterfaces(source);
  assert.deepEqual(interfaces.get('CardProps')?.picks, [{ interfaceName: 'ActionProps', propNames: ['locale', 'onLike'] }]);
});
