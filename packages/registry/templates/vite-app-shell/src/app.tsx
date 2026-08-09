import { Alert, Button, Container, Stack, Surface } from '@unpopping-candy/ui';

export function App() {
  return (
    <Container size="md">
      <main aria-labelledby="popcandy-app-title">
        <Stack gap={6}>
          <header>
            <p className="popcandy-app-shell__eyebrow">Unpopping Candy</p>
            <h1 id="popcandy-app-title">A restrained React application shell</h1>
            <p>Replace this content with the user task. Keep remote state and navigation in the application.</p>
          </header>
          <Alert title="Providers are configured" description="Theme and feedback surfaces are ready for application-owned workflows." tone="success" />
          <Surface border padding="lg">
            <Stack gap={4}>
              <h2>Next action</h2>
              <p>Search the Unpopping Candy catalog before adding a new component.</p>
              <Button variant="primary">Continue</Button>
            </Stack>
          </Surface>
        </Stack>
      </main>
    </Container>
  );
}
