import React, { useState } from 'react';
import { Input, Button, List, Card, Checkbox } from 'antd';
import type { CheckboxProps } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import Search from 'antd/es/transfer/search';

interface SyllabusViewModel {
    year: number;
    season: string;
    day: string;
    period: string;
    teacher: string;
    name: string;
    lectureId: string;
    credits: number;
    url: string;
    type: string;
    faculty: string;
  }

interface SearchPropsModel {
  name: boolean,
  teacher: boolean,
};

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SyllabusViewModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchProps, setSearchProps] = useState<SearchPropsModel>({ name: false, teacher: false});

  const fetchResults = async () => {
    if (!query) return;
    const root_url = 'http://localhost:8080/syllabus';
    setLoading(true);
    let endpoint: string | undefined;
    if (searchProps.name) {
      endpoint = 'course?name=';
    } else if (searchProps.teacher) {
      endpoint = 'teacher?name=';
    } else {
      endpoint = 'course?name='; // 両方検索する場合はここを変更
    }
    try {
      const response = await fetch(`${root_url}/${endpoint}${query}`);
      const data: SyllabusViewModel[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error("APIからデータを取得中にエラーが発生しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const useTeacher: CheckboxProps['onChange'] = (e) => {
    if (e.target.checked) {
      setSearchProps({ ...searchProps, teacher: true });
    } else {
      setSearchProps({ ...searchProps, teacher: false });
    }
  };

  const useCourse: CheckboxProps['onChange'] = (e) => {
    if (e.target.checked) {
      setSearchProps({ ...searchProps, name: true });
    } else {
      setSearchProps({ ...searchProps, name: false });
    }
  }
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchResults();
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <Input
        placeholder="授業名・教員名は部分一致"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        style={{ width: 300, marginRight: '10px' }}
      />
    <Button type="primary" onClick={fetchResults} loading={loading}>
        検索
    </Button>
    <Checkbox onChange={useCourse} style={{ marginLeft: '10px' }}>科目名</Checkbox>
    <Checkbox onChange={useTeacher} style={{ marginLeft: '10px' }}>教員名</Checkbox>
      <List
        itemLayout="vertical"
        size="large"
        pagination={{
          onChange: page => {
            console.log(page);
          },
          pageSize: 10,
        }}
        dataSource={results}
        renderItem={item => (
          <List.Item
            key={item.lectureId}
          >
            <List.Item.Meta
              title={<a href={item.url}>{item.name}<LinkOutlined /></a>}
              description={`${item.teacher} (${item.faculty})`}
            />
            <p>{`年度: ${item.year}, ${item.season}, 曜日: ${item.day}, 時限: ${item.period}, 単位: ${item.credits}`}</p>
            <p>{`科目区分: ${item.type}`}</p>
          </List.Item>
        )}
      />
    </div>
  );
};

export default SearchPage;
