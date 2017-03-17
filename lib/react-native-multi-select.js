import React, { Component, PropTypes } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ListView,
} from 'react-native';
import _ from 'underscore';
import { InputGroup, Input, Icon } from 'native-base';
import IconMd from 'react-native-vector-icons/MaterialIcons';

import styles, { colorPack } from './styles';

export default class MultiSelect extends Component {
  static propTypes = {
    selectedItems: PropTypes.array,
    items: PropTypes.array.isRequired,
    uniqueKey: PropTypes.string,
    fontFamily: PropTypes.string,
    selectedItemsChange: PropTypes.func.isRequired,
    selectedItemFontFamily: PropTypes.string,
    itemFontFamily: PropTypes.string,

    tagStyle: PropTypes.object,
    selectedStyle: PropTypes.object,
    buttonStyle: PropTypes.object,
    selectorViewStyle: PropTypes.object,

    searchInputPlaceholderText: PropTypes.string,
    searchInputStyle: PropTypes.object,
    selectText: PropTypes.string,
    altFontFamily: PropTypes.string,
  };

  //    tagBorderColor: PropTypes.string,
  //    tagTextColor: PropTypes.string,
  //    tagRemoveIconColor: PropTypes.string,

  //    selectedItemTextColor: PropTypes.string,
  //    selectedItemIconColor: PropTypes.string,
  //    itemTextColor: PropTypes.string,

  static defaultProps = {
    selectedItems: [],
    items: [],
    uniqueKey: '_id',
    fontFamily: '',
    selectedItemsChange: () => {},
    selectedItemFontFamily: '',
    itemFontFamily: '',

    tagStyle: {
      tagBorderColor: colorPack.primary,
      tagTextColor: colorPack.primary,
      tagRemoveIconColor: colorPack.danger,
    },

    selectedStyle: {
      selectedItemTextColor: colorPack.primary,
      selectedItemIconColor: colorPack.primary,
      itemTextColor: colorPack.textPrimary,
    },

    buttonStyle: {
    },

    selectorViewStyle: {
    },
    
    searchInputPlaceholderText: 'Search',
    searchInputStyle: { color: colorPack.textPrimary },
    selectText: 'Select',
    altFontFamily: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      selector: false,
      searchTerm: '',
      selectedItems: this.props.selectedItems,
      items: this.props.items,
    };
  }

  // tagStyle used here
  _displaySelectedItems = () => {
    const selectedItems = [...this.state.selectedItems];
    return selectedItems.map(item => (
      <View
        style={[
          styles.selectedItem,
          {
            borderColor: this.props.tagStyle.tagBorderColor,
          },
        ]}
        key={item[this.props.uniqueKey]}
      >
        <Text
          style={{
            flex: 1,
            color: this.props.tagStyle.tagTextColor,
            fontFamily: this.props.fontFamily,
            fontSize: 15,
          }}
        >
          {item.name}
        </Text>
        <TouchableOpacity onPress={() => { this._removeItem(item); }}>
          <IconMd
            name="cancel"
            style={{
              color: this.props.tagStyle.tagRemoveIconColor,
              fontSize: 22,
              marginLeft: 10,
            }}
          />
        </TouchableOpacity>
      </View>
    ));
  };

  _removeItem = (item) => {
    const selectedItems = [...this.state.selectedItems];
    const newItems = _.reject(selectedItems, singleItem => (
      item[this.props.uniqueKey] === singleItem[this.props.uniqueKey]
    ));
    this.setState({
      selectedItems: newItems,
    });
    // broadcast new selected items state to parent component
    this.props.selectedItemsChange(newItems);
  };

  _removeAllItems = () => {
    this.setState({
      selectedItems: [],
    });
    this.props.selectedItemsChange([]);
  };

  _toggleSelector = () => {
    this.setState({
      selector: !this.state.selector,
    });
  };

  _submitSelection = () => {
    this._toggleSelector();
    // reset searchTerm
    this.setState({ searchTerm: '' });
    // broadcast selected items state to parent component
    this.props.selectedItemsChange([...this.state.selectedItems]);
  };

  _itemSelected = item => (
    !!_.find(this.state.selectedItems, singleItem => (
      item[this.props.uniqueKey] === singleItem[this.props.uniqueKey]
    ))
  );

  _toggleItem = (item) => {
    const selectedItems = [...this.state.selectedItems];
    const status = this._itemSelected(item);
    let newItems = [];
    if (status) {
      newItems = _.reject(selectedItems, singleItem => (
        item[this.props.uniqueKey] === singleItem[this.props.uniqueKey]
      ));
    } else {
      selectedItems.push(item);
    }
    this.setState({
      selectedItems: status ? newItems : selectedItems,
    });
  };

  // selectedStyle used here
  _itemStyle = item => (
    this._itemSelected(item) ? {
      fontFamily: this.props.selectedItemFontFamily,
      color: this.props.selectedStyle.selectedItemTextColor,
    } : {
      fontFamily: this.props.itemFontFamily,
      color: this.props.selectedStyle.itemTextColor,
    }
  );

  // selectedStyle used here
  _getRow = item => (
    <TouchableOpacity
      onPress={() => this._toggleItem(item)}
      style={{ paddingLeft: 20, paddingRight: 20 }}
    >
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.itemToSelect, this._itemStyle(item)]}>{item.name}</Text>
          {
            this._itemSelected(item) ?
              <IconMd
                name="check"
                style={{
                  fontSize: 20,
                  color: this.props.selectedStyle.selectedItemIconColor,
                }}
              /> :
              null
          }
        </View>
      </View>
    </TouchableOpacity>
  );

  _filterItems = (searchTerm) => {
    const items = [...this.state.items];
    const filteredItems = [];
    items.forEach((item) => {
      const parts = searchTerm.trim().split(/[ \-:]+/);
      const regex = new RegExp(`(${parts.join('|')})`, 'ig');
      if (regex.test(item.name)) {
        filteredItems.push(item);
      }
    });
    return filteredItems;
  };

  _renderItems = () => {
    let items;
    let component = null;
    const searchTerm = this.state.searchTerm.trim();
    if (searchTerm) {
      items = this._filterItems(searchTerm);
    } else {
      items = this.state.items;
    }

    if (items.length) {
      const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      const dataSource = ds.cloneWithRows(items);
      component = (
        <ListView
          enableEmptySections
          dataSource={dataSource}
          renderRow={rowData => this._getRow(rowData)}
        />
      );
    } else {
      component = (
        <View style={{ flexDirection: 'row', alignItems: 'center' }} >
          <Text style={[styles.noItemsText,{fontFamily: this.props.fontFamily}]}>
            No item to display.
          </Text>
        </View>
      );
    }
    return component;
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          marginBottom: 10,
        }}
      >
        {
          this.state.selector
          ?
            <View style={[styles.selectorView,this.props.selectorViewStyle]}>
              <InputGroup
                style={{
                  paddingLeft: 16,
                  backgroundColor: colorPack.light,
                }}
              >
                <Icon
                  name="ios-search"
                  style={{ fontSize: 20, color: colorPack.placeholderTextColor }}
                />
                <Input
                  onChangeText={searchTerm => this.setState({ searchTerm })}
                  placeholder={this.props.searchInputPlaceholderText}
                  placeholderTextColor={colorPack.placeholderTextColor}
                  style={this.props.searchInputStyle}
                />
              </InputGroup>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  backgroundColor: '#fafafa',
                }}
              >
                {this._renderItems()}
              </View>
              <TouchableOpacity
                onPress={() => this._submitSelection()}
                style={[styles.button, this.props.buttonStyle]}
              >
                <Text style={[styles.buttonText, { fontFamily: this.props.fontFamily }]}>Submit</Text>
              </TouchableOpacity>
            </View>
            :
            <View>
              <View style={[styles.dropdownView,this.props.dropdownViewStyle]}>
                <View style={[styles.subSection, { paddingTop: 10, paddingBottom: 10 }]}>
                  <TouchableWithoutFeedback onPress={this._toggleSelector}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                      <Text
                        style={[{
                            fontFamily: this.props.altFontFamily ? this.props.altFontFamily : this.props.fontFamily
                          },this.props.selectedTextStyle]}>
                        {this.props.selectText}
                      </Text>
                      <IconMd
                        name="arrow-drop-down"
                        style={styles.indicator}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </View>
              {
                this.state.selectedItems.length ?
                  <ScrollView
                    horizontal={false}
                    style={styles.footerWrapperNC}
                    contentContainerStyle={[styles.footerWrapper]}
                  >
                    {this._displaySelectedItems()}
                  </ScrollView>
                  :
                  null
              }
            </View>
        }
      </View>
    );
  }
}

