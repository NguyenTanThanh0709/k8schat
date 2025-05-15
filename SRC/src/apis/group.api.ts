import http from 'src/utils/http'
import { GroupReponse } from 'src/types/user.type'
import { SuccessResponse, GroupMemberInfo, AddMembersBody} from 'src/types/utils.type'

import { GroupTListConfig } from 'src/types/product.type'

interface CreateGroupBody {
  ownerPhone: string
  name: string
}

interface CreateGroupResponse {
  message: string
}

const GroupApi = {
    getGroupList(queryConfig: GroupTListConfig,phone: string) {
        return http.get<SuccessResponse<GroupReponse[]>>(`/api/user/group/group/${phone}`, {params: queryConfig})
      },
      createGroup(body: CreateGroupBody) {
        return http.post<CreateGroupResponse>(
          '/api/user/group/group/',
          body
        )
      },

      getGroupMemberInfo(group_id: string) {
        return http.get<GroupMemberInfo[]>(`/api/user/group/group/member/${group_id}`)
      },
      addMembersToGroup(groupId: string, body: AddMembersBody) {
        return http.post<SuccessResponse<string>>(`/api/user/group/group/member/${groupId}`, body)
      },
      removeMembersFromGroup(groupId: string, phone: string) {
        return http.delete<string>(`/api/user/group/group/member/${groupId}/${phone}`)
      }

}
  
  export default GroupApi