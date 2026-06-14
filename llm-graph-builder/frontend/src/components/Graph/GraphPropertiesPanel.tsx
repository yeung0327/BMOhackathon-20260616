import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LoadingSpinner } from '@neo4j-ndl/react';
import { ResizePanelDetails } from './ResizePanel';
import { BasicNode, BasicRelationship, GraphPropertiesPanelProps } from '../../types';
import { LegendsChip } from './LegendsChip';
import GraphPropertiesTable from './GraphPropertiesTable';
import { chatBotAPI } from '../../services/QnaAPI';
import { llms } from '../../utils/Constants';

const sortAlphabetically = (a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase());

const isNode = (item: BasicNode | BasicRelationship): item is BasicNode => {
  return 'labels' in item && !('from' in item) && !('to' in item);
};

const GraphPropertiesPanel = ({ inspectedItem, newScheme }: GraphPropertiesPanelProps) => {
  const inspectedItemType = isNode(inspectedItem) ? 'node' : 'relationship';
  const [summary, setSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const summaryCache = useRef<Record<string, string>>({});

  const isDocumentNode = isNode(inspectedItem) && (inspectedItem as BasicNode).labels?.includes('Document');
  const fileName = isDocumentNode ? (inspectedItem as BasicNode).properties?.fileName || '' : '';

  const fetchSummary = useCallback(async (docName: string) => {
    if (!docName || summaryCache.current[docName]) {
      setSummary(summaryCache.current[docName] || '');
      return;
    }
    setSummaryLoading(true);
    setSummary('');
    try {
      const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();
      const { response } = await chatBotAPI(
        `请用3-5句话总结"${docName}"这份文档的核心内容和关键要点`,
        sessionId,
        llms[0],
        'fulltext',
        []
      );
      const msg = response?.data?.data?.message || '暂无摘要';
      summaryCache.current[docName] = msg;
      setSummary(msg);
    } catch {
      setSummary('摘要生成失败，请稍后重试');
    }
    setSummaryLoading(false);
  }, []);

  useEffect(() => {
    if (isDocumentNode && fileName) {
      fetchSummary(fileName);
    } else {
      setSummary('');
    }
  }, [isDocumentNode, fileName, fetchSummary]);

  const filteredProperties =
    inspectedItemType === 'node'
      ? Object.entries((inspectedItem as BasicNode).properties)
          .filter(([, value]) => value !== null && value !== undefined && value !== ' ')
          .reduce(
            (acc, [key, value]) => {
              acc[key] = value;
              return acc;
            },
            {} as Record<string, any>
          )
      : {};
  const properties =
    inspectedItemType === 'node'
      ? [
          {
            key: '<id>',
            value: `${(inspectedItem as BasicNode).id}`,
            type: 'String',
          },
          ...Object.keys(filteredProperties).map((key) => {
            const value = filteredProperties[key];
            return { key, value };
          }),
        ]
      : [
          {
            key: '<element_id>',
            value: `${(inspectedItem as BasicRelationship).id}`,
            type: 'String',
          },
          {
            key: '<from>',
            value: `${(inspectedItem as BasicRelationship).from}`,
            type: 'String',
          },
          {
            key: '<to>',
            value: `${(inspectedItem as BasicRelationship).to}`,
            type: 'String',
          },
          {
            key: '<caption>',
            value: `${(inspectedItem as BasicRelationship).caption ?? ''}`,
            type: 'String',
          },
        ];
  const labelsSorted = useMemo(() => {
    if (isNode(inspectedItem)) {
      return [...inspectedItem.labels].sort(sortAlphabetically);
    }
    return [];
  }, [inspectedItem]);

  return (
    <>
      <ResizePanelDetails.Title>
        <h6 className='mr-auto'>{inspectedItemType === 'node' ? 'Node details' : 'Relationship details'}</h6>
      </ResizePanelDetails.Title>
      <ResizePanelDetails.Content>
        <div className='mx-4 flex! flex-row flex-wrap gap-2'>
          {isNode(inspectedItem) ? (
            labelsSorted.map((label) => (
              <LegendsChip type='node' key={`node ${label}`} label={label} scheme={newScheme} />
            ))
          ) : (
            <LegendsChip
              type='relationship'
              label={(inspectedItem as BasicRelationship).caption ?? ''}
              key={`relationship ${(inspectedItem as BasicRelationship).id}`}
              scheme={{}}
            />
          )}
        </div>
        <div className='bg-palette-neutral-border-weak my-3 h-px w-full' />
        <GraphPropertiesTable propertiesWithTypes={properties} />
        {isDocumentNode && (
          <div className='mx-4 mt-4'>
            <div className='bg-palette-neutral-border-weak my-3 h-px w-full' />
            <h6 className='mb-2 text-sm font-medium'>📝 AI 摘要</h6>
            {summaryLoading ? (
              <div className='flex items-center gap-2 text-sm opacity-70'>
                <LoadingSpinner size='small' /> 正在生成摘要...
              </div>
            ) : (
              <p className='text-sm leading-relaxed opacity-90'>{summary}</p>
            )}
          </div>
        )}
      </ResizePanelDetails.Content>
    </>
  );
};

export default GraphPropertiesPanel;
