import { AppDataSource } from "../database/data-source";
import { Group } from "../database/entities/GroupEntity";
import {User} from "../database/entities/UserEntity";
import {GroupMember} from "../database/entities/GroupMemberEntity";
import { CreateGroupInput, Group as GroupInterface, GroupMemberInfo  } from '../interface/type';

export const createGroupService = async (input: CreateGroupInput): Promise<GroupInterface> => {
  const { name, ownerPhone } = input;

  if (!name || !ownerPhone) {
    throw new Error('Missing name or ownerPhone');
  }

  const owner = await AppDataSource.getRepository(User).findOne({ where: { phone: ownerPhone } });

  if (!owner) {
    throw new Error('Owner not found');
  }

  const group = await AppDataSource.getRepository(Group).save({
    name,
    owner_phone: owner.phone, // Linking owner as a User object
  });

  // Create the group member entry for the owner
  await AppDataSource.getRepository(GroupMember).save({
    group_id: group.id,
    user_phone: ownerPhone,
    role: 'owner' as const,
    status: true,
    group: group,
    user: owner
  });

  return {
    ...group,
    id: BigInt(group.id)
  };
};

export const getGroupsByUserPhone = async (phone: string, name?: string) => {
  const groups = await AppDataSource.getRepository(GroupMember).find({
    where: { user_phone: phone },
    relations: ['group'], // load associated group
  });
// Map the results to return only the group data
const groups1 = groups.map(groupMember => groupMember.group);
return groups1;
};

export const getGroupMembersByGroupId = async (groupId: number): Promise<GroupMemberInfo[]> => {
  if (!groupId) {
    throw new Error('Missing groupId');
  }

  const members = await  AppDataSource.getRepository(GroupMember)
    .createQueryBuilder('gm')
    .leftJoinAndSelect('gm.user', 'user')
    .where('gm.group_id = :groupId', { groupId })
    .andWhere('gm.status = true')
    .getMany();

  return members.map(m => ({
    group_id: m.group_id.toString(),
    user_phone: m.user_phone,
    role: m.role || 'member',
    joined_at: m.joined_at?.toISOString() || '',
    status: m.status ? 1 : 0,
    name: m.user.name,
    email: m.user.email,
    avatar: m.user.avatar,
    user_status: m.user.status || '',
  }));
};

export const addMembersToGroup = async (groupId: number, memberPhones: string[]): Promise<string> => {
  if (!groupId || !memberPhones || memberPhones.length === 0) {
    throw new Error('Missing groupId or memberPhones');
  }

  const group = await AppDataSource.getRepository(Group).findOne({ where: { id: groupId } });

  if (!group) {
    throw new Error('Group not found');
  }

  const groupMembers = memberPhones.map(phone => ({
    group_id: groupId,
    user_phone: phone,
    role: 'member' as const,
    status: true
  }));

  // Batch insert the members
  await AppDataSource.getRepository(GroupMember).save(groupMembers);

  return 'OK';
};


export const removeMemberFromGroup = async (groupId: number, userPhone: string): Promise<string> => {
  if (!groupId || !userPhone) {
    throw new Error('Missing groupId or userPhone');
  }

  const member = await AppDataSource.getRepository(GroupMember)
    .findOne({ where: { group_id: groupId, user_phone: userPhone } });

  if (!member) {
    throw new Error('Member not found in group');
  }

  // Check if the member is the owner
  if (member.role === 'owner') {
    return 'Failed'; // You cannot remove the owner
  }

  await AppDataSource.getRepository(GroupMember).delete({ group_id: groupId, user_phone: userPhone });

  return 'Deleted';
};