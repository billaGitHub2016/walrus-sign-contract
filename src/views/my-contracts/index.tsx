import { Button, Card, message, Space, Table, TableProps } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import { useState } from "react";
import { suiClient } from "../../config/sui-network";
import { SuiObjectResponse } from "@mysten/sui/client";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { packageId, baseAggregatorUrl } from "../sign-contract";

const MyContracts: React.FC = () => {
  const [data, setData] = useState<DataType[]>();
  const [loading, setLoading] = useState(false);
  const account = useCurrentAccount();

  const fetchData = async () => {
    setLoading(true);
    // setTimeout(() => {
    //   setLoading(false);
    // }, 2000);
    try {
      const nftList = await getAllNfts();
      setData(nftList.map((item: any, index) => {
        const fields = item.data.content.fields;
        const createDate = new Date(parseInt(fields.create_date)).toLocaleString()
        const diffDay = parseInt(fields.end_epoch) - parseInt(fields.start_epoch)
        const endDate = new Date(parseInt(fields.create_date) + diffDay * 1000 * 60 * 60 * 24).toLocaleString()
        return {
          ...fields,
          seqNo: index + 1,
          createDate,
          validateDate: `${createDate} ~ ${endDate}`
        };
      }));
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAllNfts = async () => {
    let hasNextPage = true;
    let nextCursor: string | null = null;
    let allObjects: SuiObjectResponse[] = [];
    while (hasNextPage) {
      const response = await suiClient.getOwnedObjects({
        owner: account?.address as string,
        options: {
          showContent: true,
          // showDisplay: true,
          showType: true,
        },
        cursor: nextCursor,
        filter: {
          StructType: `${packageId}::c_nft::CNFT`,
        },
      });

      allObjects = allObjects.concat(response.data);
      console.log("object res = ", response);
      hasNextPage = response.hasNextPage;
      nextCursor = response.nextCursor ?? null;
    }
    return allObjects;
  };

  return (
    <Card style={{ marginTop: "15px" }}>
      <Space
        style={{
          textAlign: "right",
          width: "100%",
          justifyContent: "flex-end",
          marginBottom: "15px",
        }}
      >
        <Button onClick={() => fetchData()}>
          <RedoOutlined />
          刷新
        </Button>
      </Space>
      <ContractTable
        dataSource={data}
        loading={loading}
      ></ContractTable>
    </Card>
  );
};

interface DataType {
  createDate: string;
  bolb_id: string;
  name: string;
}
interface ContractTableProps
  extends Omit<
    TableProps,
    "dataSource" | "loading" | "pagination" | "onChange"
  > {
  dataSource: any;
  loading: boolean;
  onChange?: TableProps["onChange"];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}
const ContractTable = (props: ContractTableProps) => {
  type ColumnsType<T> = TableProps<T>["columns"];

  const download = (url: string, name: string) => {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('下载失败，请稍后再试');
        }
        return response.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob); // 创建Blob URL
        link.download = name; // 设置下载文件名
        link.style.display = 'none'; // 隐藏链接
        document.body.appendChild(link); // 将链接添加到DOM中
        link.click(); // 触发下载
        window.URL.revokeObjectURL(link.href); // 释放URL对象
        document.body.removeChild(link); // 移除链接元素
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });
  }

  const columns: ColumnsType<DataType> = [
    {
      title: "序号",
      dataIndex: "seqNo",
      width: "8%",
    },
    {
      title: "签署日期",
      dataIndex: "createDate",
      width: "15%",
    },
    {
      title: "有效日期",
      dataIndex: "validateDate",
      width: "30%",
    },
    {
      title: "下载链接",
      dataIndex: "blob_id",
      render: (blob_id, item) => {
        const blobUrl = `${baseAggregatorUrl}/v1/${blob_id}`;
        return <a href="#" onClick={() => { download(blobUrl, item.name) }}>{item.name}</a>;
      },
    },
  ];

  return (
    <Table
      columns={columns}
      rowKey={(_, index) => index as number}
      dataSource={props.dataSource}
      loading={props.loading}
      scroll={{ y: "calc(100vh - 450px)" }}
      pagination={{ position: ['none'] }}
    />
  );
};

export default MyContracts;
