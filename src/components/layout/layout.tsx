import React, { useState } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BarChartOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import { ConnectButton } from '@mysten/dapp-kit';
import './layout.css';
import { Breadcrumb } from 'antd';
import { routes } from '../../main.tsx'

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
                        <div className="flex w-1/4">
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
                            <h1>SUI-Contracts</h1>
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
                                key: '/my-contracts',
                                icon: <BarChartOutlined />,
                                label: '我的合同'
                            }
                        ]}
                    />
                </Sider>
                <Content
                    style={{
                        // margin: '16px',
                        padding: '16px 24px 16px 24px',
                        minHeight: 280,
                        // background: colorBgContainer,
                        // borderRadius: borderRadiusLG,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >   
                    <BreadcrumbComponent />
                    <div className='flex-grow'>
                        <Outlet/>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

function BreadcrumbComponent() {
    const location = useLocation();
    const breadcrumbNameMap = new Map(routes.map(item => [item.path, item.breadcrumbName]));

    const pathSnippets = location.pathname.split('/').filter(i => i);
    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        return (
            <Breadcrumb.Item key={url}>
                <Link to={url}>{breadcrumbNameMap.get(url)}</Link>
            </Breadcrumb.Item>
        );
    });

    const breadcrumbItems = [
        <Breadcrumb.Item key="home">
            <Link to="/">首页</Link>
        </Breadcrumb.Item>
    ].concat(extraBreadcrumbItems);

    return <Breadcrumb className='mb-4'>{breadcrumbItems}</Breadcrumb>;
}

export default App;
