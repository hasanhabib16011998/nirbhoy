create vite app for react typescript

delete src folder

create app.tsx:
const App = () => {
  return (
    <div>App</div>
  )
}

export default App;

create main.tsx:
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App/>
)

install tailwind css:
npm install -D tailwindcss@3

npx tailwindcss init -p
npm install -D tailwindcss-animate
