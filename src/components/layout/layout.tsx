import React, { useState } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BarChartOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { ConnectButton } from '@mysten/dapp-kit';
import './layout.css';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    // const {
    //     token: { colorBgContainer, borderRadiusLG },
    // } = theme.useToken();

    const navigate = useNavigate();

    const location = useLocation();

    const onMenuClick = (e: any) => {
        navigate(e.key);
    };

    return (
        <Layout style={{ height: '100vh' }}>
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 20px',
                    color: '#fff',
                }}
            >
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div className="left">
                            <Button
                                type='text'
                                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{
                                    fontSize: '16px',
                                    width: 64,
                                    height: 64,
                                    color: '#fff',
                                }}
                            />
                            {/* <h1>SUI-CS</h1> */}
                        </div>

                        <ConnectButton />
                    </div>
                </>
            </Header>

            <Layout>
                <Sider trigger={null} collapsible collapsed={collapsed}>
                    <div className='demo-logo-vertical' />
                    <Menu
                        theme='dark'
                        mode='inline'
                        defaultSelectedKeys={[location.pathname]}
                        onClick={onMenuClick}
                        items={[
                            {
                                key: '/datas',
                                icon: <BarChartOutlined />,
                                label: '我的合同'
                            }
                        ]}
                    />
                </Sider>
                <Content
                    style={{
                        // margin: '16px',
                        padding: 24,
                        minHeight: 280,
                        // background: colorBgContainer,
                        // borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default App;
