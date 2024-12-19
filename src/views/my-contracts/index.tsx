import { Button, Card, Space, Table, TableProps } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import { useState } from "react";

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

  const fetchData = ({
    pageNo,
    pageSize,
    searchData,
  }: {
    pageNo?: number | undefined;
    pageSize?: number | undefined;
    searchData?: any;
  }) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
    // return getAllTags().then((tagsData) => {
    //   return http({
    //     url: "/api/data",
    //     params: {
    //       pageNo: pageNo || 1,
    //       pageSize: pageSize || 10,
    //       ...searchData,
    //     },
    //   }).then(({ data }) => {
    //     const dataList = data.dataInfo.map((item: any, index: number) => {
    //       const tags = item.tags.map((id: string) => {
    //         const match = tagsData.find(
    //           (tag: { id: string; name: string }) => tag.id === id
    //         );
    //         return {
    //           id,
    //           // @ts-ignore
    //           name: match && match.name,
    //         };
    //       });
    //       return {
    //         seqNo:
    //           (data.pageInfo.pageNo - 1) * data.pageInfo.pageSize + index + 1,
    //         ...item,
    //         tags,
    //       };
    //     });
    //     setData(dataList);
    //     setLoading(false);
    //     setTableParams({
    //       pagination: {
    //         ...tableParams.pagination,
    //         current: data.pageInfo.pageNo,
    //         pageSize: data.pageInfo.pageSize,
    //         total: data.pageInfo.total,
    //         // total: 59
    //       },
    //     });
    //   });
    // });
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
        <Button
          onClick={() =>
            fetchData({
              pageNo: tableParams.pagination?.current,
            })
          }
        >
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
      pagination={props.pagination}
      loading={props.loading}
      scroll={{ y: "calc(100vh - 450px)" }}
    />
  );
};

export default MyContracts;
