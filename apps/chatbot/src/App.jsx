import './App.css'
import ChatSupport from './components/ChatSupport';

function App() {

  if(import.meta.env.MODE == 'production') return null;
  return (
    <ChatSupport
      token={'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTQxMzE2YzcwMGFjNjJhNWE2ZjJlNyIsImlhdCI6MTc3OTcwMDUwMiwiZXhwIjoxNzgwMzA1MzAyfQ.yi-Dc-6B6PeMocW6C86DUHtcjzkatyqq9PcQWOOt4QI'}
      userId={'6a141316c700ac62a5a6f2e7'}
    />
  )
}

export default App;
