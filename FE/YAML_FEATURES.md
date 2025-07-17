# Enhanced YAML Contract Viewing Features

This document describes the enhanced YAML viewing and editing capabilities implemented in the GenContract AI frontend.

## 🎯 Overview

The application now provides comprehensive YAML contract visualization and editing features, making it easier to understand, analyze, and modify data contracts.

## 📋 Features

### 1. YAML Viewer Component (`yaml-viewer.tsx`)

**Purpose**: Displays YAML contract content with enhanced visualization

**Key Features**:
- **Formatted View**: Collapsible tree structure showing YAML hierarchy
- **Raw View**: Syntax-highlighted YAML with color coding
- **Copy to Clipboard**: One-click copying of contract content
- **Download**: Save contract as `.yaml` file
- **Statistics**: Shows line count, file size, and structure metrics

**Usage**:
```tsx
<YAMLViewer 
  content={contract.content} 
  title="Contract Content"
  showActions={true}
/>
```

### 2. YAML Syntax Highlighter (`yaml-syntax-highlighter.tsx`)

**Purpose**: Provides color-coded syntax highlighting for YAML content

**Color Scheme**:
- **Keys**: Blue (`text-blue-600`)
- **Strings**: Green (`text-green-600`)
- **Numbers**: Orange (`text-orange-600`)
- **Booleans**: Purple (`text-purple-600`)
- **Comments**: Green (`text-green-600`)
- **Array Items**: Red (`text-red-500`)

**Features**:
- Proper indentation handling
- Multi-line string support
- Comment highlighting
- Array and object detection

### 3. YAML Contract Analyzer (`yaml-contract-analyzer.tsx`)

**Purpose**: Analyzes YAML contracts and provides insights about structure and quality

**Analysis Components**:

#### Contract Overview
- Contract ID and version
- Classification level
- Description summary

#### Data Fields Analysis
- Field count and types
- Field descriptions
- Type distribution

#### Constraints & Security
- Constraint rules
- Security settings (encryption, access control)
- Data quality metrics

#### Quality Scoring
- **Completeness Score**: Based on required fields presence
- **Security Score**: Based on security measures implementation
- Visual progress bars

#### SLA Information
- Availability requirements
- Update cadence
- Service level metrics

### 4. YAML Editor (`yaml-editor.tsx`)

**Purpose**: Advanced YAML editing with validation and preview

**Features**:
- **Real-time Validation**: Checks YAML syntax and structure
- **Error Highlighting**: Shows line-specific errors and warnings
- **Preview Mode**: Live preview with syntax highlighting
- **Analyzer Integration**: Built-in contract analysis
- **Save/Reset**: Content management controls

**Validation Rules**:
- Proper key-value format
- Consistent indentation (multiples of 2)
- Empty value warnings
- Basic YAML syntax compliance

## 🎨 UI Components

### Formatted View
- Collapsible tree structure
- Expand/collapse indicators
- Nested level visualization
- Type indicators (`{...}`, `[...]`)

### Raw View
- Syntax highlighting
- Proper indentation
- Scrollable content
- Copy/download actions

### Analysis Dashboard
- Card-based layout
- Progress indicators
- Badge status indicators
- Grid responsive design

## 📊 Contract Analysis Metrics

### Completeness Score
Calculated based on presence of:
- Contract ID
- Description
- Fields definition
- Constraints
- Security settings
- Quality metrics
- SLA information

### Security Score
Calculated based on:
- Encryption settings
- Access control
- Retention policy
- Security constraints

## 🔧 Implementation Details

### File Structure
```
FE/components/ui/
├── yaml-viewer.tsx           # Main viewer component
├── yaml-syntax-highlighter.tsx  # Syntax highlighting
├── yaml-contract-analyzer.tsx   # Contract analysis
└── yaml-editor.tsx           # Advanced editor
```

### Dependencies
- React hooks for state management
- Lucide React for icons
- Tailwind CSS for styling
- Custom UI components from shadcn/ui

### Integration Points

#### Contract View Page (`/contracts/[id]`)
- Uses `YAMLViewer` for content display
- Uses `YAMLContractAnalyzer` for insights
- Provides copy/download functionality

#### Contract Edit Page (`/contracts/[id]/edit`)
- Uses `YAMLEditor` for advanced editing
- Real-time validation
- Preview and analyzer integration

#### Contract Creation Page (`/create`)
- Uses `YAMLViewer` for generated content preview
- Shows formatted view of AI-generated contracts

## 🚀 Usage Examples

### Basic YAML Viewer
```tsx
<YAMLViewer 
  content={yamlContent}
  title="My Contract"
  showActions={true}
/>
```

### Editor with Analysis
```tsx
<YAMLEditor
  value={content}
  onChange={setContent}
  title="Edit Contract"
  showPreview={true}
  showAnalyzer={true}
/>
```

### Syntax Highlighter Only
```tsx
<YAMLSyntaxHighlighter 
  content={yamlContent}
  className="custom-styles"
/>
```

### Contract Analysis
```tsx
<YAMLContractAnalyzer 
  content={contractYaml}
/>
```

## 🎯 Benefits

### For Users
1. **Better Understanding**: Visual hierarchy makes complex contracts easier to understand
2. **Quality Assurance**: Real-time validation prevents errors
3. **Insights**: Analysis provides contract quality metrics
4. **Efficiency**: Copy/download features save time
5. **Accessibility**: Multiple view modes cater to different preferences

### For Developers
1. **Modular Design**: Components can be used independently
2. **Extensible**: Easy to add new analysis metrics
3. **Maintainable**: Clear separation of concerns
4. **Reusable**: Components work across different pages

## 🔮 Future Enhancements

### Planned Features
1. **Auto-completion**: YAML schema-based suggestions
2. **Diff View**: Compare contract versions
3. **Export Options**: PDF, JSON, XML formats
4. **Collaboration**: Real-time editing with multiple users
5. **Templates**: Pre-built contract templates
6. **Validation Rules**: Custom validation rule configuration

### Technical Improvements
1. **Performance**: Virtual scrolling for large contracts
2. **Accessibility**: Screen reader support
3. **Internationalization**: Multi-language support
4. **Offline Support**: Local storage for drafts

## 🐛 Troubleshooting

### Common Issues

#### YAML Not Parsing Correctly
- Check indentation (should be multiples of 2)
- Ensure proper key-value format
- Verify no tabs (use spaces only)

#### Analysis Not Showing
- Ensure YAML has proper structure
- Check for required sections (fields, constraints, etc.)
- Verify content is not empty

#### Editor Validation Errors
- Review error messages for specific line numbers
- Check for missing colons or values
- Ensure consistent indentation

### Debug Tips
1. Use browser dev tools to inspect component state
2. Check console for validation errors
3. Test with simple YAML first
4. Verify content format matches expected structure

## 📝 Contributing

When adding new features to the YAML components:

1. **Follow the existing patterns** for component structure
2. **Add proper TypeScript types** for all props and state
3. **Include error handling** for edge cases
4. **Write tests** for new functionality
5. **Update documentation** for new features

### Code Style
- Use functional components with hooks
- Implement proper error boundaries
- Follow accessibility guidelines
- Use consistent naming conventions
- Add JSDoc comments for complex functions

## 📚 Resources

### YAML Specification
- [YAML 1.2 Specification](https://yaml.org/spec/1.2/spec/)
- [YAML Syntax Guide](https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html)

### React Best Practices
- [React Hooks Documentation](https://react.dev/reference/react)
- [TypeScript with React](https://www.typescriptlang.org/docs/handbook/react.html)

### UI/UX Guidelines
- [Material Design](https://material.io/design)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) 