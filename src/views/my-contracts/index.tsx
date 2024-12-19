import { Button, Card, GetProp, message, Space, Table, TableProps } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import { useState } from "react";
import { suiClient } from "../../config/sui-network";
import { SuiObjectResponse } from "@mysten/sui/client";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { packageId } from "../sign-contract";

type TablePaginationConfig = Exclude<
  GetProp<TableProps, "pagination">,
  boolean
>;
interface TableParams {
  pagination?: TablePaginationConfig;
}

const MyContracts: React.FC = () => {
  const [data, setData] = useState<DataType[]>();
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total) => `共 ${total} 条数据`,
      current: 1,
      pageSize: 10,
    },
  });
  const account = useCurrentAccount();

  const fetchData = async () => {
    setLoading(true);
    // setTimeout(() => {
    //   setLoading(false);
    // }, 2000);
    try {
      const nftList = await getAllNfts();
      setData(nftList.map((item: any) => item.data.content.fields));
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
        pagination={tableParams.pagination}
        loading={loading}
      ></ContractTable>
    </Card>
  );
};

interface DataType {
  signDate: string;
  downloadLink: string;
}
interface ContractTableProps
  extends Omit<
    TableProps,
    "dataSource" | "loading" | "pagination" | "onChange"
  > {
  dataSource: any;
  pagination: any;
  loading: boolean;
  onChange?: TableProps["onChange"];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}
const ContractTable = (props: ContractTableProps) => {
  type ColumnsType<T> = TableProps<T>["columns"];
  const columns: ColumnsType<DataType> = [
    {
      title: "序号",
      dataIndex: "seqNo",
      width: "8%",
    },
    {
      title: "签署日期",
      dataIndex: "signDate",
      width: "15%",
    },
    {
      title: "下载链接",
      dataIndex: "downloadLink",
    },
  ];

  return (
    <Table
      columns={columns}
      rowKey={(_, index) => index as number}
      dataSource={props.dataSource}
      loading={props.loading}
      scroll={{ y: "calc(100vh - 450px)" }}
    />
  );
};

export default MyContracts;
