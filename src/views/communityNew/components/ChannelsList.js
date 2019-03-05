// @flow
import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import Icon from 'src/components/icons';
import viewNetworkHandler from 'src/components/viewNetworkHandler';
import getCommunityChannels from 'shared/graphql/queries/community/getCommunityChannelConnection';
import type { GetCommunityChannelConnectionType } from 'shared/graphql/queries/community/getCommunityChannelConnection';
import type { Dispatch } from 'redux';
import { withCurrentUser } from 'src/components/withCurrentUser';
import {
  SidebarSectionHeader,
  SidebarSectionHeading,
  List,
  ChannelListItem,
  ChannelListItemContent,
  ChannelName,
} from '../style';

type Props = {
  data: {
    community: GetCommunityChannelConnectionType,
  },
  isLoading: boolean,
  dispatch: Dispatch<Object>,
  currentUser: Object,
  communitySlug: string,
};

class Component extends React.Component<Props> {
  sortChannels = (array: Array<any>): Array<?any> => {
    if (!array || array.length === 0) return [];

    const generalChannel = array.find(channel => channel.slug === 'general');
    const withoutGeneral = array.filter(channel => channel.slug !== 'general');
    const sortedWithoutGeneral = withoutGeneral.sort((a, b) => {
      if (a.slug < b.slug) return -1;
      if (a.slug > b.slug) return 1;
      return 0;
    });
    if (generalChannel) {
      sortedWithoutGeneral.unshift(generalChannel);
      return sortedWithoutGeneral;
    } else {
      return sortedWithoutGeneral;
    }
  };
  render() {
    const {
      communitySlug,
      data: { community },
    } = this.props;

    if (community && community.channelConnection) {
      const { isOwner } = community.communityPermissions;
      const channels = community.channelConnection.edges
        .map(channel => channel && channel.node)
        .filter(channel => {
          if (!channel) return null;
          if (channel.isArchived) return null;
          if (channel.isPrivate && !channel.channelPermissions.isMember)
            return null;

          return channel;
        })
        .filter(channel => channel && !channel.channelPermissions.isBlocked);

      const sortedChannels = this.sortChannels(channels);

      return (
        <React.Fragment>
          <SidebarSectionHeader>
            <SidebarSectionHeading>Channels</SidebarSectionHeading>
            {isOwner && (
              <Link to={`/${community.slug}/settings`}>
                <Icon
                  glyph={'settings'}
                  tipLocation={'left'}
                  tipText={'Manage channels'}
                  size={24}
                />
              </Link>
            )}
          </SidebarSectionHeader>

          <List>
            {sortedChannels.map(channel => {
              if (!channel) return null;
              return (
                <ChannelListItem
                  to={`/${communitySlug}/${channel.slug}`}
                  key={channel.id}
                >
                  <ChannelListItemContent>
                    {channel.isPrivate && (
                      <Icon glyph="private-outline" size={14} />
                    )}
                    <ChannelName>{channel.name}</ChannelName>
                  </ChannelListItemContent>
                  <Icon glyph="view-forward" size={24} />
                </ChannelListItem>
              );
            })}
          </List>
        </React.Fragment>
      );
    }

    return null;
  }
}

export const ChannelsList = compose(
  getCommunityChannels,
  viewNetworkHandler,
  withCurrentUser,
  connect()
)(Component);