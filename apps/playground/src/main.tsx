import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
// Theme tokens + Tailwind. Form chrome ships with the ejected <EasyForm>
// (it imports its own easy-forms.css), exactly as a real consumer gets it.
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>
);
