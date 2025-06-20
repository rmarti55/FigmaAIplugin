interface LayoutNode {
  type: 'FRAME' | 'TEXT' | 'RECTANGLE' | 'GROUP';
  name?: string;
  children?: LayoutNode[];
  props?: {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    fills?: readonly Paint[];
    strokes?: readonly Paint[];
    effects?: readonly Effect[];
    characters?: string;
    fontSize?: number;
    fontName?: FontName;
    constraints?: LayoutConstraint;
    layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
    primaryAxisSizingMode?: 'FIXED' | 'AUTO';
    counterAxisSizingMode?: 'FIXED' | 'AUTO';
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    itemSpacing?: number;
  };
}

interface LayoutConstraint {
  horizontal: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE';
  vertical: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE';
}

export async function createFigmaNodes(layout: LayoutNode, parent?: BaseNode & ChildrenMixin): Promise<SceneNode> {
  let node: SceneNode;

  // Create the base node based on type
  switch (layout.type) {
    case 'FRAME':
      node = figma.createFrame();
      break;
    case 'TEXT':
      node = figma.createText();
      break;
    case 'RECTANGLE':
      node = figma.createRectangle();
      break;
    case 'GROUP':
      if (!parent) throw new Error('Parent node required for creating groups');
      node = figma.group([], parent);
      break;
    default:
      throw new Error(`Unsupported node type: ${layout.type}`);
  }

  // Set node name if provided
  if (layout.name) {
    node.name = layout.name;
  }

  // Apply properties if they exist
  if (layout.props) {
    const props = layout.props;
    Object.entries(props).forEach(([key, value]) => {
      if (value !== undefined) {
        switch (key) {
          case 'width':
            if (typeof value === 'number') node.resize(value, node.height);
            break;
          case 'height':
            if (typeof value === 'number') node.resize(node.width, value);
            break;
          case 'x':
            if (typeof value === 'number') node.x = value;
            break;
          case 'y':
            if (typeof value === 'number') node.y = value;
            break;
          case 'fills':
            if ('fills' in node && Array.isArray(value)) {
              (node as GeometryMixin).fills = value as readonly Paint[];
            }
            break;
          case 'strokes':
            if ('strokes' in node && Array.isArray(value)) {
              (node as GeometryMixin).strokes = value as readonly Paint[];
            }
            break;
          case 'effects':
            if ('effects' in node && Array.isArray(value)) {
              (node as BlendMixin).effects = value as readonly Effect[];
            }
            break;
          case 'characters':
            if (node.type === 'TEXT' && typeof value === 'string') node.characters = value;
            break;
          case 'fontSize':
            if (node.type === 'TEXT' && typeof value === 'number') node.fontSize = value;
            break;
          case 'fontName':
            if (node.type === 'TEXT') node.fontName = value as FontName;
            break;
          case 'constraints':
            if ('constraints' in node) node.constraints = value as LayoutConstraint;
            break;
          case 'layoutMode':
            if (node.type === 'FRAME') {
              node.layoutMode = value as ('HORIZONTAL' | 'VERTICAL' | 'NONE');
              if (value !== 'NONE' && props.primaryAxisSizingMode) {
                node.primaryAxisSizingMode = props.primaryAxisSizingMode;
                node.counterAxisSizingMode = props.counterAxisSizingMode || 'AUTO';
                if (props.itemSpacing) node.itemSpacing = props.itemSpacing;
                if (props.paddingLeft) node.paddingLeft = props.paddingLeft;
                if (props.paddingRight) node.paddingRight = props.paddingRight;
                if (props.paddingTop) node.paddingTop = props.paddingTop;
                if (props.paddingBottom) node.paddingBottom = props.paddingBottom;
              }
            }
            break;
        }
      }
    });
  }

  // Create and append children if they exist
  if (layout.children && layout.children.length > 0) {
    const childNodes = await Promise.all(
      layout.children.map(child => createFigmaNodes(child, node as BaseNode & ChildrenMixin))
    );
    if (node.type === 'FRAME' || node.type === 'GROUP') {
      childNodes.forEach(childNode => node.appendChild(childNode));
    }
  }

  // If there's a parent, append the node
  if (parent) {
    parent.appendChild(node);
  }

  return node;
}

export function validateLayout(layout: any): layout is LayoutNode {
  if (!layout || typeof layout !== 'object') return false;
  if (!['FRAME', 'TEXT', 'RECTANGLE', 'GROUP'].includes(layout.type)) return false;
  
  if (layout.name && typeof layout.name !== 'string') return false;
  
  if (layout.children) {
    if (!Array.isArray(layout.children)) return false;
    return layout.children.every(validateLayout);
  }
  
  return true;
} 