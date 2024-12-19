import './App.css'
import Layout from './components/layout'
import { ConfigProvider } from 'antd';

function App() {

  return (
    <ConfigProvider>
      <Layout></Layout>
    </ConfigProvider>
  )
}

export default App
