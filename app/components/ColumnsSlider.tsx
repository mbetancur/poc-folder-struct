import { Flex, Box, Stack, Container } from '@mantine/core';
import { Link } from 'react-router';
import type { BarkNode } from '~/routes/content-library.$';

// TODO: consider adding use-move hook to handle the dragging size of the columns
function Column({ data }: { data: BarkNode[] }) {
  return (
    <Stack className={"border-solid border-3 border-gray-500"}>
      {data.map((item) => (
        <Box
          key={item.id}
          className="min-w-100"
        >
          <Link to={'/content-library' + item.displayPath}>
            {item.isFolder ? ' 📁' : ' 📄'}
            {item?.name}
          </Link>
        </Box>
      ))}
    </Stack>
  );
}

function EmptyColumn() {
  return (
    <Stack className={"border-solid border-3 border-gray-500"}>
      <Box className="min-w-100" > No Content</Box>
    </Stack>
  );
}

export default function ColumnsSlider({ rootFolder, nodes }: { rootFolder: BarkNode, nodes: BarkNode[][] }) {

  return (
    <Container className={"overflow-x-auto"} size="100%" pb={"md"}>
      <Flex
        direction={{ base: 'row' }}
      >
        <Column data={[rootFolder]} />
        {/* TODO: Improve these nested conditions*/}
        {nodes.length > 0 ?
          nodes.map((child) => (
            child.length > 0 ?
              <Column key={child[0].id} data={child} />
              : <EmptyColumn key={Math.random()} /> // TODO: Add drop files component
          ))
          : <EmptyColumn />
        }
      </Flex>
    </Container>
  );
}