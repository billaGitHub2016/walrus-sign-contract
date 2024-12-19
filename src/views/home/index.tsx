// import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Card } from 'antd';
import Meta from "antd/es/card/Meta";
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const navigate = useNavigate();

    return <Card
        className="cursor-pointer hover:shadow-lg transition-shadow duration-300 ease-in-out"
        onClick={() => navigate('/sign-contract')}
        style={{ width: 300 }}
        cover={
            <img
                alt="example"
                src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
            />
        }
        actions={[
            // <SettingOutlined key="setting" />,
            // <EditOutlined key="edit" />,
            // <EllipsisOutlined key="ellipsis" />,
        ]}
    >
        <Meta
            avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />}
            title="您有一份合同待签署"
            description="请点击查看"
        />
    </Card>
}

export default Home;