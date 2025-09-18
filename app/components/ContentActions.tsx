import { Button } from "@mantine/core";
import { Form } from "react-router";
import type { BarkNode } from "~/routes/content-library.$";

interface ContentActionsProps {
  parentNode: BarkNode;
}

export default function ContentActions({ parentNode }: ContentActionsProps) {
  return (
    <div className="flex gap-4 m-4">
      <Form method="post">
        <input type="hidden" name="parentId" value={parentNode.id} />
        <input type="hidden" name="displayPath" value={parentNode.displayPath} />
        <input type="hidden" name="intent" value="create-folder" />
        <Button type="submit">Create Folder</Button>
      </Form>
      <Form method="post" encType="multipart/form-data">
        <input type="hidden" name="parentId" value={parentNode.id} />
        <input type="hidden" name="displayPath" value={parentNode.displayPath} />
        <input type="hidden" name="intent" value="upload-file" />

        {/* // TODO: Add button styles to show the file input */}
        {/* TODO: Add files restriction */}
        <input
          type="file" 
          name="file" 
          required
          className="file:hidden bg-gray-200 p-1 rounded-md"
          onChange={(e) => e.target.form?.requestSubmit()}
        />
      </Form>
    </div>
  );
}
