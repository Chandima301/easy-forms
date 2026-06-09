import { createContext } from 'react';
import type { FormStore } from '../store/types';

export const FormStoreContext = createContext<FormStore | null>(null);
