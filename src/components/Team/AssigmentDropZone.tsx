import { useDroppable } from '@dnd-kit/core';

interface AssignmentDropzoneProps {
  id: string;
  children: React.ReactNode;
  title: string;
}

export default function AssignmentDropzone({ id, children, title }: AssignmentDropzoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  const style = {
    backgroundColor: isOver ? '#e0f2fe' : '#f9fafb', // Light blue when hovering over
  };

  return (
    <div className="mt-2">
      <h4 className="font-semibold text-gray-600 text-sm mb-2">{title}</h4>
      <div
        ref={setNodeRef}
        style={style}
        className="p-2 border-2 border-dashed rounded min-h-[60px] space-y-2 transition-colors"
      >
        {children}
      </div>
    </div>
  );
}