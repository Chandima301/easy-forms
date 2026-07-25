import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
// Theme tokens + Tailwind. Form chrome is utility-styled inside the ejected
// <EasyForm>/<GroupRenderer>/<Wizard> components — no separate chrome CSS.
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>
);
