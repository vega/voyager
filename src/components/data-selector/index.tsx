import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';

import Modal from 'react-modal';
// import {default as modal} from 'react-modal';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import * as vega from 'vega';
import { NamedData } from 'vega-lite/build/src/data';

import * as styles from './data-selector.scss';

import {
  ActionHandler,
  createDispatchHandler,
  DatasetAsyncAction,
  datasetLoad,
} from '../../actions';
import {DEFAULT_DATASETS} from '../../constants';
import {Dataset, State} from '../../models';
import {selectDataset} from '../../selectors';

export interface DataSelectorOwnProps {
  title: 'Change' | 'Load';
}

export interface DataSelectorConnectProps {
  data: Dataset;
}

export type DataSelectorProps = DataSelectorConnectProps & DataSelectorOwnProps & ActionHandler<DatasetAsyncAction>;

export interface DataSelectorState {
  modalIsOpen: boolean;
  dataText: string;
  dataName: string;
  dataUrl: string;
  fileType: string;
}

export class DataSelectorBase extends React.PureComponent<DataSelectorProps, DataSelectorState> {

  constructor(props: DataSelectorProps) {
    super(props);

    this.state = {modalIsOpen: false, dataText: '', dataName: '', dataUrl: '', fileType: undefined};

    this.onDatasetChange = this.onDatasetChange.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.renderDataset = this.renderDataset.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
    this.onDataTextSubmit = this.onDataTextSubmit.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleFileTypeChange = this.handleFileTypeChange.bind(this);
    this.onDataUrlSubmit = this.onDataUrlSubmit.bind(this);
  }

  public render() {
    const {title} = this.props;

    return (
      <span styleName='data-selector'>
        <button onClick={this.openModal}>{title}</button>
        <Modal
         isOpen={this.state.modalIsOpen}
         onRequestClose={this.closeModal}
         contentLabel="Data Selector"
         styleName="modal"
       >
          <div className='modal-header'>
            <a styleName='modal-close' onClick={this.closeModal}>close</a>
            <h3>Add Dataset</h3>
          </div>
          <Tabs className={styles['react-tabs']}>
            <TabList className={styles['tab-list']}>
              <Tab className={styles.tab}>Change Dataset</Tab>
              <Tab className={styles.tab}>Paste or Upload Data</Tab>
              <Tab className={styles.tab}>From URL</Tab>
            </TabList>

            <TabPanel className={styles['tab-panel']}>
              {this.renderDatasetPanel()}
            </TabPanel>
            <TabPanel className={styles['tab-panel']}>
              <div>
                {this.renderUploadPanel()}
                {this.renderPastePanel()}
              </div>
            </TabPanel>
            <TabPanel className={styles['tab-panel']}>
              {this.renderUrlPanel()}
            </TabPanel>
          </Tabs>
       </Modal>
      </span>
    );
  }

  private renderDataset(dataset: NamedData) {
    const selected = (dataset.name === this.props.data.name) ? styles['element-selected'] : null;

    return (
      <li key={dataset.name} className={`${styles['dataset-list-element']} ${selected}`} >
        <a onClick={this.onDatasetChange.bind(this, dataset)}>
          <i className="fa fa-database" /> {dataset.name}
        </a>
      </li>
    );
  }

  private renderDatasetPanel() {
    return (
      <div>
        <ul styleName='dataset-list'>
          {DEFAULT_DATASETS.map(this.renderDataset)}
        </ul>
      </div>
    );
  }

  private renderUploadPanel() {
    return (
      <div styleName='upload-panel'>
        <div className='form-group'>
          <label htmlFor='data-file'>File</label>
          <input id='data-file' type='file' onChange={this.onFileChange} />
        </div>
        <p>Upload a data file, or paste data in CSV format into the input.</p>
        <div styleName='dropzone-target' />
      </div>
    );
  }

  private renderUrlPanel() {
    return (
      <div styleName='url-panel'>
        <p>
          Add the name of the dataset and the URL to a <b> JSON </b>, <b> CSV </b> (with header), or
          <b> TSV </b> file. Make sure that the formatting is correct and clean the data before adding it.
          The added dataset is only visible to you.
        </p>
        <div className='form-group'>
          <label htmlFor='filetype-selector'>File Type</label>
          <select value={this.state.fileType} onChange={this.handleFileTypeChange} id='filetype-selector'>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="tsv">TSV</option>
          </select>
        </div>
        <div className='form-group'>
          <label htmlFor='data-name'>Name</label>
          <input
            name='dataName'
            value={this.state.dataName}
            onChange={this.handleTextChange}
            id='data-name'
            type='name'
          />
        </div>
        <div className='form-group'>
          <label htmlFor='data-url'>URL</label>
          <input
            name='dataUrl'
            value={this.state.dataUrl}
            onChange={this.handleTextChange}
            id='data-url'
            type='name'
          />
        </div>
        <button onClick={this.onDataUrlSubmit}>Add Dataset</button>
      </div>
    );
  }

  private handleFileTypeChange(event: any) {
    this.setState({fileType: event.target.value});
  }

  private renderPastePanel() {
    return (
      <div styleName='paste-panel'>
        <div className='form-group'>
          <label htmlFor='data-name'>Name</label>
          <input
            name='dataName'
            value={this.state.dataName}
            onChange={this.handleTextChange}
            id='data-name'
            type='name'
          />
        </div>
        <div className='form-group'>
          <textarea
            name='dataText'
            value={this.state.dataText}
            onChange={this.handleTextChange}
          />
        </div>
        <button onClick={this.onDataTextSubmit}>Add Data</button>
      </div>
    );
  }

  private onDatasetChange(dataset: NamedData) {
    this.props.handleAction(datasetLoad(dataset.name, dataset));
    this.closeModal();
  }

  private onFileChange(event: any) {
    const { handleAction } = this.props;
    const reader = new FileReader();

    const file = event.target.files[0];

    reader.onload = (lEvent: any) => {
      const name = file.name.replace(/\.\w+$/, '');
      const format = file.name.split('.').pop();

      let values;
      try {
        values = vega.read(lEvent.target.result, {type: format});
      } catch (err) {
        window.alert(err.message);
      }

      handleAction(datasetLoad(name, {values, format}));
    };

    reader.readAsText(file);
  }

  private onDataTextSubmit() {
    const values = vega.read(this.state.dataText, {type: 'csv'});
    this.props.handleAction(datasetLoad(this.state.dataName, {values}));
  }

  private loadDataString(data: string) {
    const name = this.state.dataName;
    const fileType = this.state.fileType;
    const values = vega.read(data, {type: fileType});
    this.props.handleAction(datasetLoad(name, {values}));
  }

  private onDataUrlSubmit() {
    const loader = vega.loader();
    loader.load(this.state.dataUrl).then(data => {
      this.loadDataString(data);
    }).catch(error => {
      console.warn('Error occurred while loading data: ', error);
    });
  }

  private openModal() {
    this.setState({modalIsOpen: true});
  }

  private closeModal() {
    this.setState({modalIsOpen: false});
  }

  // https://facebook.github.io/react/docs/forms.html
  private handleTextChange(event: any) {
    const name = event.target.name;
    this.setState({[name]: event.target.value});
  }
}

const DataSelectorRenderer = CSSModules(DataSelectorBase, styles);

export const DataSelector = connect<DataSelectorConnectProps, ActionHandler<DatasetAsyncAction>, DataSelectorOwnProps>(
  (state: State) => {
    return {
      data: selectDataset(state)
    };
  },
  createDispatchHandler<DatasetAsyncAction>()
)(DataSelectorRenderer);
