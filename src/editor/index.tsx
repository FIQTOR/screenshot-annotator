import React from 'react';
import ReactDOM from 'react-dom/client';
import { EditorApp } from './components/EditorApp';
import '../index.css';

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <EditorApp />
    </React.StrictMode>
  );
}

