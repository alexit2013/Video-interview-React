import React from 'react'
import './index.less'
import http from '../../api'
import dayjs from 'dayjs'
import * as Cookies from "js-cookie";

class Index extends React.Component {
  state = {
    list: []
  }

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.httRoomInterviewList()
  }

  async httRoomInterviewList () {
    let apiInterview = await http.apiInterview()
    console.log(apiInterview)
    await this.setState({list: apiInterview})
  }

  roomId(even) {
    console.log(even)
    localStorage.setItem('roomId', even)
    Cookies.set('channel', even)
    this.props.history.push('/meeting')
  }

  render() {
    return (
      <div className='all' style={{height:  document.body.offsetHeight + 'px'}}>
        {
          this.state.list.map((val, key) => (
            <div className='room' key={key} onClick={this.roomId.bind(this, val.interview_id)}>
              <p>面试人：{val.candidate_name}</p>
              <p>面试时间：{dayjs(Number(val.interview_at) * 1000).format("YYYY-MM-DD HH:mm:ss")}</p>
            </div>
            )
          )
        }
      </div>
    )
  }
}

export default Index