export interface ToolItem {
  name: string;
  icon?: any;
  level: number;
}

export interface ToolCategory {
  category: string;
  items: ToolItem[];
}
