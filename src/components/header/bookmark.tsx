import * as React from 'react';

export class Bookmark extends React.PureComponent<any, any> {
  public render() {
    return (
      <button>
        <i className='fa fa-bookmark' /> Bookmarks (0)
      </button>
    );
  }
}
