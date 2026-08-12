import assert from 'node:assert/strict';
import test from 'node:test';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import { createPopcandyMcpServer } from '../src/server.ts';
import type { PopcandyMcpDomain } from '../src/types.ts';

test('server-scoped project root reaches static and templated resource reads', async () => {
  // Given a server bound immutably to one project root
  const calls: { readonly uri: string; readonly projectPath: string | undefined }[] = [];
  const domain: PopcandyMcpDomain = {
    listResources: () => [
      { uri: 'popcandy://catalog', name: 'Catalog', description: 'Catalog', mimeType: 'application/json' },
      { uri: 'popcandy://components/ui.button', name: 'Button', description: 'Button', mimeType: 'application/json' },
    ],
    async readResource(uri, projectPath) {
      calls.push({ uri, projectPath });
      return { uri, name: uri, description: uri, mimeType: 'application/json', text: '{}' };
    },
    async projectInfo() { return {}; },
    async search() { return {}; },
    async get() { return {}; },
    async compose() { return {}; },
    async validate() { return {}; },
    async scaffold() { return {}; },
    listPrompts: () => [],
    getPrompt: () => ({ description: '', text: '' }),
  };
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  clientTransport.onmessage = () => undefined;
  await clientTransport.start();
  const server = createPopcandyMcpServer(domain, { projectRoot: '/selected/project' });
  await server.connect(serverTransport);
  await clientTransport.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'test', version: '1' } } });
  await clientTransport.send({ jsonrpc: '2.0', method: 'notifications/initialized' });

  // When static and templated resources are read through the MCP protocol
  await clientTransport.send({ jsonrpc: '2.0', id: 2, method: 'resources/read', params: { uri: 'popcandy://catalog' } });
  await clientTransport.send({ jsonrpc: '2.0', id: 3, method: 'resources/read', params: { uri: 'popcandy://components/ui.button' } });
  await clientTransport.close();

  // Then both reads use only the server-scoped root
  assert.deepEqual(calls, [
    { uri: 'popcandy://catalog', projectPath: '/selected/project' },
    { uri: 'popcandy://components/ui.button', projectPath: '/selected/project' },
  ]);
});
