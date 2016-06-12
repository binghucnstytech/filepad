import BlockType from 'components/BlockType.js';

export function defaultDataForBlockType(type) {
  switch (type) {
    case BlockType.Footer: {
      return {
        text: 'Page footer',
        justAdded: true,
      };
    }

    case BlockType.LargeImage: {
      return {
        file: {},
      };
    }

    case BlockType.SingleFile: {
      return {
        title: 'Title',
        hasDescription: false,
        description: 'Description',
        file: {},
      };
    }

    case BlockType.TwoFiles: {
      return {
        dataA: {
          title: 'Title',
          hasDescription: false,
          description: 'Description',
          file: {},
        },
        dataB: {
          title: 'Title',
          hasDescription: false,
          description: 'Description',
          file: {},
        },
      };
    }

    case BlockType.FileList: {
      return {
        thumbnailsMode: 'fill',
        files: [],
      };
    }

    case BlockType.Text:
      return {
        text: 'Text Paragraph',
        justAdded: true,
      };

    case BlockType.RichText:
      return {
        text: 'Text Paragraph',
        justAdded: true,
      };

    case BlockType.Title:
      return {
        text: 'Page Header',
        justAdded: true,
      };

    case BlockType.Subtitle:
      return {
        text: 'Section Header',
        justAdded: true,
      };
  }
}
