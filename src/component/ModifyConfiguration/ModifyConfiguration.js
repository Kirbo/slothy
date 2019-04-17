import React, { Component } from 'react';
import styled from 'styled-components';
import { Drawer, Form, Button, Col, Row, Input, Select, Radio, Divider } from 'antd';
import emoji from 'node-emoji';

import { Consumer } from '../../container/App/Context';
import Emoji from '../../component/Emoji';
import { sortBy } from '../../assets/utils';

import { DIMENSION } from '../../assets/css';

const { Option } = Select;

class ModifyConfiguration extends Component {
  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Consumer>
        {({
          drawerVisible,
          drawerConfig,
          slackInstances,
          viewType,
          selectedView,
          searchEmoji,
          selectedEmoji,
          setProperty,
          emojiLimit,
          saveConfiguration,
          removeConfiguration,
          savingConfiguration,
          removingConfiguration,
        }) => {
          if (
            !drawerVisible
            && (
              !drawerConfig
              || (
                (drawerConfig && drawerConfig.config && !drawerConfig.config.id)
                && (drawerConfig && !drawerConfig.id)
              )
            )
          ) {
            return null;
          } else if (!drawerVisible && drawerConfig) {
            this.props.form.resetFields();
          }

          const instance = slackInstances.find(({ id }) => id === (viewType === 'instance' ? selectedView : drawerConfig.config.instanceId));
          const { emojis } = instance;

          const handleDelete = () => {
            removeConfiguration(drawerConfig.config.id);
          }

          const handleClose = () => {
            setProperty({ drawerVisible: false });
          }

          const handleSubmit = event => {
            event.preventDefault();
            this.props.form.validateFields((err, values) => {
              if (!err) {
                saveConfiguration({
                  ...values,
                  emoji: values.emoji ? `:${values.emoji}:` : null,
                });
              }
            });
          }

          const allEmojis = [
            ...Object.keys(emojis).map(key => ({ key, value: emojis[key] })).sort(sortBy('key')),
            ...emoji.search('').sort(sortBy('key')),
          ];

          const selectEmoji = selectedEmoji
            || (drawerConfig
              && drawerConfig.config
              && drawerConfig.config.emoji
              && drawerConfig.config.emoji.replace(/:/g, '')
            )
            || undefined
          ;

          let searchedEmojis = allEmojis.filter(({ key, value }) => key.includes(searchEmoji));
          if (searchEmoji) {
            searchedEmojis.sort(sortBy('key'));
          }

          let filteredEmojis = searchedEmojis.slice(0, emojiLimit);
          const selected = allEmojis.find(({ key, value }) => key === selectEmoji);
          if (selectEmoji && selected) {
            filteredEmojis = filteredEmojis.filter(({ key }) => key !== selectEmoji);
            filteredEmojis.unshift(selected);
            filteredEmojis = filteredEmojis.slice(0, emojiLimit);
          }

          const isGroup = !!drawerConfig.accessPoints;

          return (
            <Styled>
              <Drawer
                title={`${drawerConfig.config.id ? 'Modify existing' : 'Add new'} configuration`}
                width="calc(100% - 300px)"
                onClose={handleClose}
                visible={drawerVisible}
              >
                <Form layout="vertical" hideRequiredMark onSubmit={handleSubmit}>
                  {getFieldDecorator('instanceId', { initialValue: drawerConfig.instanceId })(<span />)}
                  {getFieldDecorator('id', { initialValue: drawerConfig.config.id })(<span />)}
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="SSID">
                        {getFieldDecorator('ssid', {
                          initialValue: drawerConfig.ssid || null,
                        })(<div>{drawerConfig.ssid}</div>)}
                      </Form.Item>
                    </Col>
                    {(isGroup || drawerConfig.hasOwnProperty('bssid')) && (
                      <Col span={12}>
                        <Form.Item label="Access Point">
                          {getFieldDecorator('bssid', {
                            initialValue: drawerConfig.bssid ? drawerConfig.bssid : null,
                          })(
                            isGroup
                              ? (
                                <Select placeholder="Select an access point">
                                  {drawerConfig.accessPoints.map(({ bssid }) => (
                                    <Option key={bssid}>{bssid.toUpperCase()}</Option>
                                  ))}
                                </Select>
                              )
                              : (<div>{drawerConfig.bssid ? drawerConfig.bssid.toUpperCase() : ''}</div>)
                          )}
                        </Form.Item>
                      </Col>
                    )}
                  </Row>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item label="Emoji">
                        {getFieldDecorator('emoji', { initialValue: selectEmoji })(
                          <Select
                            allowClear
                            showSearch
                            placeholder="Select an emoji"
                            onSearch={value => setProperty({ searchEmoji: value })}
                            onBlur={() => setProperty({ searchEmoji: '' })}
                            onChange={value => setProperty({ searchEmoji: '', selectedEmoji: value })}
                            dropdownRender={menu => (
                              <div>
                                {menu}
                                {searchedEmojis.length > emojiLimit && (
                                  <TooManyResults>
                                    <Divider />
                                    <div className="text">
                                      Too many results, showing {emojiLimit} first.
                                    </div>
                                  </TooManyResults>
                                )}
                              </div>
                            )}
                          >
                            {filteredEmojis.map(({ key }) => (
                              <Option key={key} value={key}>
                                <Emoji emoji={key} slackInstanceId={instance.id} size="m" /> - {key}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item label="Status">
                        {getFieldDecorator('status', {
                          initialValue: drawerConfig.config.status,
                          rules: [{
                            max: 100,
                            message: 'Status can be only 100 characters long!',
                          }],
                        })(
                          <Input placeholder="Status, e.g.: Working remotely, At the Helsinki office, ..." />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Enabled">
                        {getFieldDecorator('enabled', {
                          initialValue: drawerConfig.config && drawerConfig.config.hasOwnProperty('enabled') ? drawerConfig.config.enabled : true,
                        })(
                          <Radio.Group buttonStyle="solid">
                            <Radio.Button value={true}>Enabled</Radio.Button>
                            <Radio.Button value={false}>Disabled</Radio.Button>
                          </Radio.Group>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <ActionButtons>
                    <LeftColumn>
                      <Button onClick={handleDelete} type="danger" disabled={removingConfiguration} loading={removingConfiguration}>
                        Delete
                    </Button>
                    </LeftColumn>
                    <RightColumn>
                      <Button onClick={handleClose} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                      <Button htmlType="submit" type="primary" disabled={savingConfiguration} loading={savingConfiguration}>
                        Save
                    </Button>
                    </RightColumn>
                  </ActionButtons>
                </Form>
              </Drawer>
            </Styled>
          );
        }}
      </Consumer>
    );
  }
}

const Styled = styled.div``;
const TooManyResults = styled.div`
  & .ant-divider {
    margin: 4px 0;
  }

  & div.text {
    padding: ${DIMENSION['0.5x']};
  }
`;
const ActionButtons = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e9e9e9;
  padding: 10px 16px;
  background: #fff;
  display: flex;
  flex: 1 1 100%;
`;
const LeftColumn = styled.div`
  display: flex;
  flex: 1 1 30%;
`;
const RightColumn = styled.div`
  display: flex;
  flex: 1 1 70%;
  justify-content: flex-end;
`;

export default Form.create()(ModifyConfiguration);
