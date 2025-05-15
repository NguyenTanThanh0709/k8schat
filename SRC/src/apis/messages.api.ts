import { IMessage, GetMessagesQuery } from 'src/types/utils.type'
import http1 from 'src/utils/http1'


const messagesApi = {

    sendMessage(body: IMessage) {
        return http1.post<IMessage>('/api/chat/message/send', body)
    },

    getMessage(query: GetMessagesQuery) {
        return http1.get<IMessage[]>('/api/chat/message/get-messages', {params: query})
    }
}

export default messagesApi;