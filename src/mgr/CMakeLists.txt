set(mgr_srcs
  ${CMAKE_SOURCE_DIR}/src/ceph_mgr.cc
  ${CMAKE_SOURCE_DIR}/src/mon/PGMap.cc
  ActivePyModule.cc
  ActivePyModules.cc
  BaseMgrModule.cc
  BaseMgrStandbyModule.cc
  ClusterState.cc
  DaemonHealthMetricCollector.cc
  DaemonServer.cc
  DaemonState.cc
  Gil.cc
  Mgr.cc
  MgrStandby.cc
  PyFormatter.cc
  PyModule.cc
  PyModuleRegistry.cc
  PyModuleRunner.cc
  PyOSDMap.cc
  StandbyPyModules.cc
  mgr_commands.cc)
add_executable(ceph-mgr ${mgr_srcs})
target_include_directories(ceph-mgr SYSTEM PRIVATE "${PYTHON_INCLUDE_DIRS}")
target_link_libraries(ceph-mgr
  osdc client heap_profiler
  global-static ceph-common
  Boost::python ${MGR_PYTHON_LIBRARIES} ${CMAKE_DL_LIBS} ${ALLOC_LIBS})
install(TARGETS ceph-mgr DESTINATION bin)
