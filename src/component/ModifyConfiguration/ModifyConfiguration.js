import React, { Component } from 'react';
import styled from 'styled-components';
import { Drawer, Form, Button, Col, Row, Input, Select, DatePicker, Divider } from 'antd';
import emoji from 'node-emoji';

import { Consumer } from '../../container/App/Context';
import Emoji from '../../component/Emoji';
import { sortBy } from '../../assets/utils';

const { Option } = Select;


class ModifyConfiguration extends Component {
  state = {
    selectedEmoji: null,
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Consumer>
        {({ modifyConfiguration, drawerConfig, slackInstances, selectedView, searchEmoji, selectedEmoji, setProperty, emojiLimit }) => {
          const instance = slackInstances.find(({ id }) => id === selectedView);
          const { emojis } = instance;

          const handleClose = () => modifyConfiguration(null);

          const allEmojis = [
            ...Object.keys(emojis).map(key => ({ key, value: emojis[key] })).sort(sortBy('key')),
            ...emoji.search('').sort(sortBy('key')),
          ];

          let searchedEmojis = allEmojis.filter(({ key, value }) => key.includes(searchEmoji));
          if (searchEmoji) {
            searchedEmojis.sort(sortBy('key'));
          }
          let filteredEmojis = searchedEmojis.slice(0, emojiLimit);
          const selected = allEmojis.find(({ key, value }) => key === selectedEmoji);
          if (selectedEmoji && selected) {
            filteredEmojis = filteredEmojis.filter(({ key }) => key !== selectedEmoji);
            filteredEmojis.unshift(selected);
            filteredEmojis = filteredEmojis.slice(0, emojiLimit);
          }

          return (
            <Styled>
              <Drawer
                title="Create a new account"
                width="calc(100% - 300px)"
                onClose={handleClose}
                visible={!!drawerConfig}
              >
                <Form layout="vertical" hideRequiredMark>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Name">
                        {getFieldDecorator('name', {
                          rules: [{ required: true, message: 'Please enter user name' }],
                        })(<Input placeholder="Please enter user name" />)}
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Url">
                        {getFieldDecorator('url', {
                          rules: [{ required: true, message: 'Please enter url' }],
                        })(
                          <Input
                            style={{ width: '100%' }}
                            addonBefore="http://"
                            addonAfter=".com"
                            placeholder="Please enter url"
                          />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Emoji">
                        {getFieldDecorator('emoji', {
                          rules: [{ required: true, message: 'Select an emoji' }],
                        })(
                          <Select
                            allowClear
                            showSearch
                            placeholder="Select an emoji"
                            onSearch={value => {
                              setProperty({ searchEmoji: value });
                            }}
                            onSelect={value => {
                              setProperty({
                                searchEmoji: '',
                                selectedEmoji: value,
                              });
                            }}
                            dropdownRender={menu => (
                              <div>
                                {menu}
                                {searchedEmojis.length > emojiLimit && (
                                  <React.Fragment>
                                    <Divider style={{ margin: '4px 0' }} />
                                    <div style={{ padding: '8px' }}>
                                      Too many results, showing first {emojiLimit}.
                                    </div>
                                  </React.Fragment>
                                )}
                              </div>
                            )}
                          >
                            {filteredEmojis.map(({ key }) => (
                              <Option key={key} value={key}>
                                <Emoji emoji={key} size="m" /> - {key}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Type">
                        {getFieldDecorator('type', {
                          rules: [{ required: true, message: 'Please choose the type' }],
                        })(
                          <Select placeholder="Please choose the type">
                            <Option value="private">Private</Option>
                            <Option value="public">Public</Option>
                          </Select>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Approver">
                        {getFieldDecorator('approver', {
                          rules: [{ required: true, message: 'Please choose the approver' }],
                        })(
                          <Select placeholder="Please choose the approver">
                            <Option value="jack">Jack Ma</Option>
                            <Option value="tom">Tom Liu</Option>
                          </Select>
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="DateTime">
                        {getFieldDecorator('dateTime', {
                          rules: [{ required: true, message: 'Please choose the dateTime' }],
                        })(
                          <DatePicker.RangePicker
                            style={{ width: '100%' }}
                            getPopupContainer={trigger => trigger.parentNode}
                          />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item label="Description">
                        {getFieldDecorator('description', {
                          rules: [
                            {
                              required: true,
                              message: 'please enter url description',
                            },
                          ],
                        })(<Input.TextArea rows={4} placeholder="please enter url description" />)}
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    borderTop: '1px solid #e9e9e9',
                    padding: '10px 16px',
                    background: '#fff',
                    textAlign: 'right',
                  }}
                >
                  <Button onClick={handleClose} style={{ marginRight: 8 }}>
                    Cancel
                  </Button>
                  <Button onClick={handleClose} type="primary">
                    Save
                  </Button>
                </div>
              </Drawer>
            </Styled>
          );
        }}
      </Consumer>
    );
  }
}

const Styled = styled.div``;

export default Form.create()(ModifyConfiguration);
