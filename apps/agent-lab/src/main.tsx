import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@unpopping-candy/tokens/styles.css';
import '@unpopping-candy/ui/styles.css';
import { UnpoppingCandyProvider } from '@unpopping-candy/theme';
import report from '@unpopping-candy/eval-report';
import { Badge, Container, Inline, Stack, Surface } from '@unpopping-candy/ui';
import './styles.css';

type Scenario = (typeof report.scenarios)[number];

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="agent-lab__metric"><span>{label}</span><strong>{value}</strong></div>;
}

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  return <Surface border padding="md" className="agent-lab__scenario">
    <Inline justify="space-between" align="center" gap={3}>
      <div>
        <p className="agent-lab__mode">{scenario.mode}</p>
        <h2>{scenario.task}</h2>
      </div>
      <Badge tone={scenario.passed ? 'positive' : 'critical'}>{scenario.passed ? 'Pass' : 'Fail'}</Badge>
    </Inline>
    <div className="agent-lab__score" aria-label={`Score ${scenario.score} out of 100`}>
      <span style={{ width: `${scenario.score}%` }} />
    </div>
    <div className="agent-lab__metrics">
      <Metric label="Score" value={String(scenario.score)} />
      <Metric label="Component recall" value={`${Math.round(scenario.metrics.componentRecall * 100)}%`} />
      <Metric label="State coverage" value={`${Math.round(scenario.metrics.stateCoverage * 100)}%`} />
      <Metric label="Findings" value={String(scenario.findings.length)} />
    </div>
  </Surface>;
}

function App() {
  return <UnpoppingCandyProvider scope="document" theme="light">
    <main className="agent-lab">
      <Container size="lg">
        <Stack gap={8}>
          <header className="agent-lab__header">
            <p>UNPOPPING CANDY / AGENT LAB</p>
            <h1>Measure the design context, not the confidence of the model.</h1>
            <p>{report.summary.passing} of {report.summary.total} reference scenarios pass the current release gate. Average score: {report.summary.averageScore}.</p>
          </header>
          <div className="agent-lab__grid">{report.scenarios.map((scenario) => <ScenarioCard key={scenario.id} scenario={scenario} />)}</div>
        </Stack>
      </Container>
    </main>
  </UnpoppingCandyProvider>;
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing #root application mount.');
}

createRoot(rootElement).render(<StrictMode><App /></StrictMode>);
